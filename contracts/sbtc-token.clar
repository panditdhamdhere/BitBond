;; sBTC Token for BitBond
;; Simple SIP-010 compatible fungible token

;; Errors
(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-INSUFFICIENT-BALANCE u101)
(define-constant ERR-INVALID-AMOUNT u102)

;; Token configuration
(define-data-var token-name (string-ascii 32) "Wrapped Bitcoin")
(define-data-var token-symbol (string-ascii 10) "sBTC")
(define-data-var token-decimals uint u8)
(define-data-var token-supply uint u0)

;; Storage
(define-map balances principal uint)

;; SIP-010 Functions
(define-read-only (get-name)
  (ok (var-get token-name)))

(define-read-only (get-symbol)
  (ok (var-get token-symbol)))

(define-read-only (get-decimals)
  (ok (var-get token-decimals)))

(define-read-only (get-balance (account principal))
  (ok (default-to u0 (map-get? balances account))))

(define-read-only (get-total-supply)
  (ok (var-get token-supply)))

(define-read-only (get-token-uri)
  (ok none))

;; Transfer function
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) (err ERR-UNAUTHORIZED))
    (asserts! (> amount u0) (err ERR-INVALID-AMOUNT))
    (let ((sender-balance (default-to u0 (map-get? balances sender))))
      (asserts! (>= sender-balance amount) (err ERR-INSUFFICIENT-BALANCE))
      (map-set balances sender (- sender-balance amount))
      (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
      (print {action: "transfer", sender: sender, recipient: recipient, amount: amount, memo: memo})
      (ok true)
    )
  )
)

;; Mint function for testing
(define-public (mint (amount uint) (recipient principal))
  (begin
    (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
    (var-set token-supply (+ (var-get token-supply) amount))
    (print {action: "mint", recipient: recipient, amount: amount})
    (ok true)
  )
)

;; Initialize with 1 million tokens supply
(begin
  (var-set token-supply u100000000000000)
)
