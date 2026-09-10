package models

import (
	"time"
)

type AccountType string

const (
	AccountAsset     AccountType = "ASSET"
	AccountLiability AccountType = "LIABILITY"
	AccountEquity    AccountType = "EQUITY"
	AccountRevenue   AccountType = "REVENUE"
	AccountExpense   AccountType = "EXPENSE"
)

type Account struct {
	ID            string      `json:"id"`
	AccountNumber string      `json:"account_number"`
	HolderName    string      `json:"holder_name"`
	AccountType   AccountType `json:"account_type"`
	Currency      string      `json:"currency"`
	BalanceCents  int64       `json:"balance_cents"`
	Status        string      `json:"status"`
	CreatedAt     time.Time   `json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
}

type TransactionStatus string

const (
	StatusPending          TransactionStatus = "PENDING"
	StatusApproved         TransactionStatus = "APPROVED"
	StatusBlocked          TransactionStatus = "BLOCKED"
	StatusFlaggedForReview TransactionStatus = "FLAGGED_FOR_REVIEW"
	StatusSettled          TransactionStatus = "SETTLED"
	StatusFailed           TransactionStatus = "FAILED"
)

type PaymentRequest struct {
	IdempotencyKey       string `json:"idempotency_key" binding:"required"`
	SourceAccountID      string `json:"source_account_id" binding:"required"`
	DestinationAccountID string `json:"destination_account_id" binding:"required"`
	MerchantID           string `json:"merchant_id"`
	MerchantCategoryCode string `json:"merchant_category_code"`
	AmountCents          int64  `json:"amount_cents" binding:"required,gt=0"`
	Currency             string `json:"currency"`
	PaymentMethod        string `json:"payment_method"`
	IPAddress            string `json:"ip_address"`
	DeviceFingerprint    string `json:"device_fingerprint"`
	LocationCity         string `json:"location_city"`
	LocationCountry      string `json:"location_country"`
}

type FraudEvaluationResponse struct {
	TransactionID  string        `json:"transaction_id"`
	RiskScore      int           `json:"risk_score"`
	Recommendation string        `json:"recommendation"`
	Confidence     float64       `json:"confidence"`
	Factors        []interface{} `json:"factors"`
	VelocityCount  int           `json:"velocity_count_last_5min"`
}

type Transaction struct {
	ID                   string            `json:"id"`
	IdempotencyKey       string            `json:"idempotency_key"`
	SourceAccountID      string            `json:"source_account_id"`
	DestinationAccountID string            `json:"destination_account_id"`
	MerchantID           string            `json:"merchant_id"`
	AmountCents          int64             `json:"amount_cents"`
	Currency             string            `json:"currency"`
	Status               TransactionStatus `json:"status"`
	PaymentMethod        string            `json:"payment_method"`
	IPAddress            string            `json:"ip_address"`
	DeviceFingerprint    string            `json:"device_fingerprint"`
	LocationCity         string            `json:"location_city"`
	LocationCountry      string            `json:"location_country"`
	RiskScore            int               `json:"risk_score"`
	RiskReasons          []interface{}     `json:"risk_reasons"`
	CreatedAt            time.Time         `json:"created_at"`
	SettledAt            *time.Time        `json:"settled_at,omitempty"`
}

type LedgerEntry struct {
	ID             string    `json:"id"`
	TransactionID  string    `json:"transaction_id"`
	AccountID      string    `json:"account_id"`
	Direction      string    `json:"direction"` // DEBIT or CREDIT
	AmountCents    int64     `json:"amount_cents"`
	Currency       string    `json:"currency"`
	SequenceNumber int64     `json:"sequence_number"`
	CreatedAt      time.Time `json:"created_at"`
}
