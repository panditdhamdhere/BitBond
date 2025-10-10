;; Bond Marketplace - Ultra Simple Version

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-PRICE (err u101))

(define-data-var next-listing-id uint u1)
(define-data-var total-listings uint u0)
(define-data-var total-volume uint u0)

(define-map listings uint {bond-id: uint, seller: principal, price: uint, created-at: uint, status: (string-utf8 20)})

(define-public (list-bond (bond-id uint) (price uint))
  (begin
    (var-set next-listing-id (+ (var-get next-listing-id) u1))
    (var-set total-listings (+ (var-get total-listings) u1))
    (map-set listings (var-get next-listing-id) {
      bond-id: bond-id,
      seller: tx-sender,
      price: price,
      created-at: burn-block-height,
      status: u"active"
    })
    (ok (var-get next-listing-id))
  ))

(define-public (buy-bond (listing-id uint))
  (begin
    (var-set total-volume (+ (var-get total-volume) (get price (unwrap! (map-get? listings listing-id) ERR-INVALID-PRICE))))
    (map-set listings listing-id (merge (unwrap! (map-get? listings listing-id) ERR-INVALID-PRICE) {status: u"sold"}))
    (ok true)
  ))

(define-public (cancel-listing (listing-id uint))
  (begin
    (map-set listings listing-id (merge (unwrap! (map-get? listings listing-id) ERR-INVALID-PRICE) {status: u"cancelled"}))
    (ok true)
  ))

(define-public (get-listing (listing-id uint))
  (ok (map-get? listings listing-id)))

(define-public (get-all-listings)
  (ok (list u1 u2 u3)))

(define-public (get-marketplace-stats)
  (ok {
    total-listings: (var-get total-listings),
    total-volume: (var-get total-volume),
    active-listings: (var-get total-listings)
  }))