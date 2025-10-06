;; BitBond - SIP-009 Bond NFT
;; Each NFT represents a liquidity bond. Metadata is immutable once minted.

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; SIP-009 Trait (local definition to avoid external dependency)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-trait sip009-nft-trait
  (
    (get-name () (response (string-utf8 32) uint))
    (get-symbol () (response (string-utf8 10) uint))
    (get-token-uri (uint) (response (optional (string-utf8 512)) uint))
    (get-owner (uint) (response (optional principal) uint))
    (transfer (uint principal principal) (response bool uint))
    (get-total-supply () (response uint uint))
  )
)

;; (impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-nft-trait)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Errors
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-NOT-OWNER u101)
(define-constant ERR-NOT-FOUND u102)
(define-constant ERR-ALREADY-EXISTS u103)
(define-constant ERR-MARKETPLACE-NOT-SET u104)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Roles & Config
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-data-var contract-owner principal tx-sender)
(define-data-var bond-vault principal tx-sender)
(define-data-var marketplace principal tx-sender)

(define-public (set-bond-vault (p principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-UNAUTHORIZED))
    (var-set bond-vault p)
    (print { event: "set-bond-vault", vault: p })
    (ok true)
  )
)

(define-public (set-marketplace (p principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-UNAUTHORIZED))
    (var-set marketplace p)
    (print { event: "set-marketplace", marketplace: p })
    (ok true)
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Storage
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-data-var total-supply uint u0)

(define-map token-owner { id: uint } { owner: principal })

;; Immutable bond metadata
(define-map bond-data { id: uint }
  {
    amount: uint,
    lock-period: uint,      ;; in days
    maturity-date: uint,    ;; burn block at maturity
    apy: uint,              ;; percent
    created-at: uint
  }
)

;; Optional pre-baked JSON metadata for token-uri
(define-map token-uri { id: uint } { uri: (string-utf8 512) })

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Helpers
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (is-owner (id uint) (who principal))
  (match (map-get? token-owner { id: id }) o
    (ok (is-eq (get owner o) who))
    (ok false)
  )
)

(define-read-only (can-transfer (id uint) (sender principal))
  (let ((is-sender-owner (unwrap-panic (is-owner id sender)))
        (is-marketplace (is-eq sender (var-get marketplace))))
    (ok (or is-sender-owner is-marketplace))
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; SIP-009 Required
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (get-name)
  (ok "BitBond Bond"))

(define-read-only (get-symbol)
  (ok "BOND"))

(define-read-only (get-total-supply)
  (ok (var-get total-supply)))

(define-read-only (get-owner (id uint))
  (ok (match (map-get? token-owner { id: id }) o (some (get owner o)) none)))

(define-read-only (get-token-uri (id uint))
  (ok (match (map-get? token-uri { id: id }) u (some (get uri u)) none)))

(define-public (transfer (id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (unwrap-panic (can-transfer id tx-sender)) (err ERR-UNAUTHORIZED))
    (match (map-get? token-owner { id: id }) o
      (begin
        (asserts! (is-eq (get owner o) sender) (err ERR-NOT-OWNER))
        (map-set token-owner { id: id } { owner: recipient })
        (print { event: "transfer", id: id, from: sender, to: recipient })
        (ok true)
      )
      (err ERR-NOT-FOUND)
    )
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Bond-specific entrypoints
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; Only bond-vault can mint
(define-public (mint (bond-id uint) (owner principal) (metadata (string-utf8 512)))
  (begin
    (asserts! (is-eq tx-sender (var-get bond-vault)) (err ERR-UNAUTHORIZED))
    (asserts! (is-none (map-get? token-owner { id: bond-id })) (err ERR-ALREADY-EXISTS))
    (map-set token-owner { id: bond-id } { owner: owner })
    (map-set token-uri { id: bond-id } { uri: metadata })
    (var-set total-supply (+ (var-get total-supply) u1))
    (print { event: "mint", id: bond-id, owner: owner })
    (ok bond-id)
  )
)

;; Only bond-vault or token owner can burn
(define-public (burn (bond-id uint))
  (begin
    (match (map-get? token-owner { id: bond-id }) o
      (let ((is-owner (is-eq (get owner o) tx-sender))
            (is-vault (is-eq tx-sender (var-get bond-vault))))
        (begin
          (asserts! (or is-owner is-vault) (err ERR-UNAUTHORIZED))
          (map-delete token-owner { id: bond-id })
          (map-delete bond-data { id: bond-id })
          (map-delete token-uri { id: bond-id })
          (var-set total-supply (- (var-get total-supply) u1))
          (print { event: "burn", id: bond-id, caller: tx-sender })
          (ok true)
        )
      )
      (err ERR-NOT-FOUND)
    )
  )
)

;; Record immutable structured metadata for off-chain convenience
(define-public (set-bond-metadata (bond-id uint) (amount uint) (lock-period uint) (maturity-date uint) (apy uint) (created-at uint))
  (begin
    (asserts! (is-eq tx-sender (var-get bond-vault)) (err ERR-UNAUTHORIZED))
    (asserts! (is-none (map-get? bond-data { id: bond-id })) (err ERR-ALREADY-EXISTS))
    (map-set bond-data { id: bond-id }
      { amount: amount, lock-period: lock-period, maturity-date: maturity-date, apy: apy, created-at: created-at })
    (print { event: "set-bond-metadata", id: bond-id })
    (ok true)
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Read-only helpers
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (get-bond-metadata (bond-id uint))
  (ok (map-get? bond-data { id: bond-id })))

;; Returns whether a principal is allowed operator (marketplace)
(define-read-only (is-approved-operator (who principal))
  (ok (is-eq who (var-get marketplace))))


