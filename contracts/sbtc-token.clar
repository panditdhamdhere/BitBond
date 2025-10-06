;; Mock sBTC Token for Testing
;; Implements SIP-010 FT trait for testing purposes

(define-trait sip010-ft-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-name () (response (string-utf8 32) uint))
    (get-symbol () (response (string-utf8 10) uint))
    (get-decimals () (response uint uint))
    (get-balance (principal) (response uint uint))
    (get-total-supply () (response uint uint))
  )
)

;; (impl-trait .sip010-ft-trait)

;; Errors
(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-INSUFFICIENT-BALANCE u101)
(define-constant ERR-INVALID-AMOUNT u102)

;; Storage
(define-data-var total-supply uint u1000000000000) ;; 1M tokens with 6 decimals
(define-data-var name (string-utf8 32) "Wrapped Bitcoin")
(define-data-var symbol (string-utf8 10) "sBTC")
(define-data-var decimals uint u6)

(define-map balances { owner: principal } { balance: uint })

;; Initialize with large balances for testing
(define-public (initialize-test-balances)
  (begin
    (map-set balances { owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM } { balance: u100000000000 })
    (map-set balances { owner: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG } { balance: u100000000000 })
    (map-set balances { owner: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC } { balance: u100000000000 })
    (map-set balances { owner: 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND } { balance: u100000000000 })
    (ok true)
  )
)

;; SIP-010 Required Functions
(define-read-only (get-name)
  (ok (var-get name)))

(define-read-only (get-symbol)
  (ok (var-get symbol)))

(define-read-only (get-decimals)
  (ok (var-get decimals)))

(define-read-only (get-total-supply)
  (ok (var-get total-supply)))

(define-read-only (get-balance (owner principal))
  (ok (default-to { balance: u0 } (map-get? balances { owner: owner }))))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (> amount u0) (err ERR-INVALID-AMOUNT))
    (asserts! (is-eq tx-sender sender) (err ERR-UNAUTHORIZED))
    
    (let (
      (sender-balance (get balance (unwrap! (map-get? balances { owner: sender }) (err ERR-INSUFFICIENT-BALANCE))))
      (recipient-balance (default-to { balance: u0 } (map-get? balances { owner: recipient })))
    )
      (begin
        (asserts! (>= sender-balance amount) (err ERR-INSUFFICIENT-BALANCE))
        (map-set balances { owner: sender } { balance: (- sender-balance amount) })
        (map-set balances { owner: recipient } { balance: (+ (get balance recipient-balance) amount) })
        (ok true)
      )
    )
  )
)
