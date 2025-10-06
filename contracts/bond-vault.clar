;; BitBond - Bond Vault
;; Provides sBTC-backed bond creation, withdrawal, and early exit with insurance pool.
;; Assumptions:
;; - sBTC conforms to SIP-010 FT trait (transfer with optional memo)
;; - Bond NFT contract exposes `mint` and `burn` entrypoints

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Traits
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-trait sip010-ft-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
  )
)

(define-trait bond-nft-trait
  (
    (mint (principal) (response uint uint))
    (burn (uint) (response bool uint))
    (get-owner (uint) (response (optional principal) uint))
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Constants
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-BAD-LOCK-PERIOD u101)
(define-constant ERR-TRANSFER-FAILED u102)
(define-constant ERR-BOND-NOT-FOUND u103)
(define-constant ERR-NOT-OWNER u104)
(define-constant ERR-NOT-MATURED u105)
(define-constant ERR-ALREADY-CLOSED u106)
(define-constant ERR-NFT-MINT-FAILED u107)
(define-constant ERR-NFT-BURN-FAILED u108)

;; Supported lock periods (days)
(define-constant PERIOD-30 u30)
(define-constant PERIOD-90 u90)
(define-constant PERIOD-180 u180)

;; APYs in percent (integer)
(define-constant APY-30 u5)   ;; 5%
(define-constant APY-90 u8)   ;; 8%
(define-constant APY-180 u12) ;; 12%

;; Approximate burn blocks per day (Bitcoin ~144 blocks/day)
(define-constant BURN-BLOCKS-PER-DAY u144)

;; Bond status codes
(define-constant STATUS-ACTIVE u0)
(define-constant STATUS-WITHDRAWN u1)
(define-constant STATUS-EARLY-EXIT u2)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Admin and external contract references
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-data-var contract-owner principal tx-sender)

;; External contracts
(define-data-var sbtc-token principal tx-sender)
(define-data-var bond-nft principal tx-sender)
(define-data-var marketplace principal tx-sender)

(define-public (set-contracts (sbtc principal) (nft principal) (market principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-UNAUTHORIZED))
    (var-set sbtc-token sbtc)
    (var-set bond-nft nft)
    (var-set marketplace market)
    (ok true)
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Storage
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-data-var next-bond-id uint u1)
(define-data-var insurance-pool uint u0)
(define-data-var total-bonds-created uint u0)

(define-map bonds
  { id: uint }
  {
    owner: principal,
    amount: uint,
    lock-period: uint,          ;; in days
    created-at: uint,           ;; burn block height when created
    maturity-date: uint,        ;; burn block height when mature
    apy: uint,                  ;; percent
    status: uint                ;; 0 active, 1 withdrawn, 2 early-exit
  }
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Utilities
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (is-supported-period (d uint))
  (ok (or (is-eq d PERIOD-30) (or (is-eq d PERIOD-90) (is-eq d PERIOD-180)))))

(define-read-only (apy-for (d uint))
  (if (is-eq d PERIOD-30)
    (ok APY-30)
    (if (is-eq d PERIOD-90)
      (ok APY-90)
      (if (is-eq d PERIOD-180)
        (ok APY-180)
        (err ERR-BAD-LOCK-PERIOD)
      )
    )
  )
)

(define-read-only (maturity-from (created uint) (days uint))
  (ok (+ created (* days BURN-BLOCKS-PER-DAY))))

(define-read-only (is-matured (created uint) (days uint))
  (let ((maturity (unwrap-panic (maturity-from created days))))
    (ok (>= burn-block-height maturity))
  )
)

;; amount * apy * days / 36500 where apy is percent (e.g., 5)
(define-read-only (calculate-yield (amount uint) (lock-period uint))
  (let ((apy (unwrap! (apy-for lock-period) (err ERR-BAD-LOCK-PERIOD))))
    (ok (/ (* amount (* apy lock-period)) u36500))
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Public functions
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-public (create-bond (amount uint) (lock-period uint))
  (begin
    (asserts! (> amount u0) (err ERR-TRANSFER-FAILED))
    (asserts! (unwrap! (is-supported-period lock-period) (err ERR-BAD-LOCK-PERIOD)) (err ERR-BAD-LOCK-PERIOD))

    (let
      (
        (sbtc (var-get sbtc-token))
        (nft (var-get bond-nft))
        (created burn-block-height)
        (apy (unwrap! (apy-for lock-period) (err ERR-BAD-LOCK-PERIOD)))
        (maturity (unwrap-panic (maturity-from burn-block-height lock-period)))
        (contract-principal (as-contract tx-sender))
      )
      (begin
        ;; pull sBTC from user to contract
        (asserts! (is-ok (contract-call? sbtc transfer amount tx-sender contract-principal none)) (err ERR-TRANSFER-FAILED))

        ;; mint bond NFT to the user to represent claim; id used as bond-id
        (let ((bond-id (var-get next-bond-id)))
          (let ((mint-res (contract-call? nft mint bond-id tx-sender "data:application/json,{\"bond-id\":1,\"amount\":1000,\"lock-period\":30,\"apy\":5}")))
            (match mint-res
              (ok mint-id)
                (begin
                  ;; record bond state keyed by NFT id
                  (map-set bonds { id: bond-id }
                    {
                      owner: tx-sender,
                      amount: amount,
                      lock-period: lock-period,
                      created-at: created,
                      maturity-date: maturity,
                      apy: apy,
                      status: STATUS-ACTIVE
                    }
                  )
                  (var-set next-bond-id (+ bond-id u1))
                  (var-set total-bonds-created (+ (var-get total-bonds-created) u1))
                  (print { event: "bond-created", id: bond-id, owner: tx-sender, amount: amount, period: lock-period })
                  (ok bond-id)
                )
              (err-code (err ERR-NFT-MINT-FAILED))
            )
          )
        )
      )
    )
  )
)

(define-public (withdraw-bond (bond-id uint))
  (begin
    (match (map-get? bonds { id: bond-id }) bond
      (begin
        (asserts! (is-eq (get owner bond) tx-sender) (err ERR-NOT-OWNER))
        (asserts! (is-eq (get status bond) STATUS-ACTIVE) (err ERR-ALREADY-CLOSED))
        (asserts! (unwrap-panic (is-matured (get created-at bond) (get lock-period bond))) (err ERR-NOT-MATURED))

        (let (
          (sbtc (var-get sbtc-token))
          (nft (var-get bond-nft))
          (payout (+ (get amount bond) (unwrap-panic (calculate-yield (get amount bond) (get lock-period bond)))))
          (contract-principal (as-contract tx-sender))
        )
          (begin
            ;; transfer sBTC back to owner
            (asserts! (is-ok (contract-call? sbtc transfer payout contract-principal (get owner bond) none)) (err ERR-TRANSFER-FAILED))
            ;; burn NFT
            (asserts! (is-ok (contract-call? nft burn bond-id)) (err ERR-NFT-BURN-FAILED))
            ;; update status
            (map-set bonds { id: bond-id } (merge bond { status: STATUS-WITHDRAWN }))
            (print { event: "bond-withdrawn", id: bond-id, owner: (get owner bond), payout: payout })
            (ok payout)
          )
        )
      )
      (err ERR-BOND-NOT-FOUND)
    )
  )
)

(define-public (early-exit (bond-id uint))
  (begin
    (match (map-get? bonds { id: bond-id }) bond
      (begin
        (asserts! (is-eq (get owner bond) tx-sender) (err ERR-NOT-OWNER))
        (asserts! (is-eq (get status bond) STATUS-ACTIVE) (err ERR-ALREADY-CLOSED))
        (let (
          (sbtc (var-get sbtc-token))
          (nft (var-get bond-nft))
          (penalty (/ (get amount bond) u10))         ;; 10%
          (refund (- (get amount bond) (/ (get amount bond) u10)))
          (contract-principal (as-contract tx-sender))
        )
          (begin
            ;; transfer 90% back to owner
            (asserts! (is-ok (contract-call? sbtc transfer refund contract-principal (get owner bond) none)) (err ERR-TRANSFER-FAILED))
            ;; accumulate penalty in insurance pool
            (var-set insurance-pool (+ (var-get insurance-pool) penalty))
            ;; burn NFT
            (asserts! (is-ok (contract-call? nft burn bond-id)) (err ERR-NFT-BURN-FAILED))
            ;; update status
            (map-set bonds { id: bond-id } (merge bond { status: STATUS-EARLY-EXIT }))
            (print { event: "bond-early-exit", id: bond-id, owner: (get owner bond), refund: refund, penalty: penalty })
            (ok refund)
          )
        )
      )
      (err ERR-BOND-NOT-FOUND)
    )
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Read-only
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (get-bond-info (bond-id uint))
  (ok (map-get? bonds { id: bond-id })))

(define-read-only (get-insurance-pool-balance)
  (ok (var-get insurance-pool)))

(define-read-only (get-total-bonds-created)
  (ok (var-get total-bonds-created)))

;; Allow marketplace to add protocol fees to insurance pool
(define-public (add-to-insurance-pool (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get marketplace)) (err ERR-UNAUTHORIZED))
    (var-set insurance-pool (+ (var-get insurance-pool) amount))
    (print { event: "insurance-pool-added", amount: amount, total: (var-get insurance-pool) })
    (ok true)
  )
)


