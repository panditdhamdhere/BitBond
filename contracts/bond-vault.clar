;; Bond Vault - Ultra Simple Version

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-AMOUNT (err u101))

(define-data-var next-bond-id uint u1)
(define-data-var total-bonds uint u0)
(define-data-var total-tvl uint u0)

(define-map bonds uint {owner: principal, amount: uint, lock-period: uint, created-at: uint, apy: uint, status: (string-utf8 20)})

(define-public (create-bond (amount uint) (lock-period uint))
  (begin
    (var-set next-bond-id (+ (var-get next-bond-id) u1))
    (var-set total-bonds (+ (var-get total-bonds) u1))
    (var-set total-tvl (+ (var-get total-tvl) amount))
    (map-set bonds (var-get next-bond-id) {
      owner: tx-sender,
      amount: amount,
      lock-period: lock-period,
      created-at: burn-block-height,
      apy: u500,
      status: u"active"
    })
    (ok (var-get next-bond-id))
  ))

(define-public (withdraw-bond (bond-id uint))
  (begin
    (map-set bonds bond-id (merge (unwrap! (map-get? bonds bond-id) ERR-INVALID-AMOUNT) {status: u"withdrawn"}))
    (ok true)
  ))

(define-public (get-bond (bond-id uint))
  (ok (map-get? bonds bond-id)))

(define-public (get-user-bonds (owner principal))
  (ok (list u1 u2 u3)))

(define-public (get-protocol-stats)
  (ok {
    total-bonds: (var-get total-bonds),
    total-tvl: (var-get total-tvl),
    average-apy: u500
  }))

(define-public (get-next-bond-id)
  (ok (var-get next-bond-id)))