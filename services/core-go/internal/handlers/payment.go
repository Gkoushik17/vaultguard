package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
	"vaultguard/core-go/internal/ledger"
	"vaultguard/core-go/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type PaymentHandler struct {
	store       *ledger.LedgerStore
	redisClient *redis.Client
	fraudURL    string
}

func NewPaymentHandler(store *ledger.LedgerStore, rdb *redis.Client) *PaymentHandler {
	fraudHost := os.Getenv("FRAUD_SERVICE_URL")
	if fraudHost == "" {
		fraudHost = "http://localhost:8000"
	}
	return &PaymentHandler{
		store:       store,
		redisClient: rdb,
		fraudURL:    fraudHost,
	}
}

func (h *PaymentHandler) ProcessPayment(c *gin.Context) {
	var req models.PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment payload", "details": err.Error()})
		return
	}

	// 1. Idempotency Check
	if existingTx, found := h.store.CheckIdempotency(req.IdempotencyKey); found {
		c.Header("X-Cache-Lookup", "HIT-IDEMPOTENT")
		c.JSON(http.StatusOK, gin.H{
			"message":     "Idempotent transaction retrieved",
			"transaction": existingTx,
		})
		return
	}

	txID := uuid.New().String()
	currency := req.Currency
	if currency == "" {
		currency = "USD"
	}

	// 2. Call Python AI Fraud Engine
	fraudEval := h.callFraudEngine(txID, req)

	// 3. Determine Transaction Outcome
	var status models.TransactionStatus
	switch fraudEval.Recommendation {
	case "BLOCKED":
		status = models.StatusBlocked
	case "FLAGGED_FOR_REVIEW":
		status = models.StatusFlaggedForReview
	default:
		status = models.StatusApproved
	}

	tx := &models.Transaction{
		ID:                   txID,
		IdempotencyKey:       req.IdempotencyKey,
		SourceAccountID:      req.SourceAccountID,
		DestinationAccountID: req.DestinationAccountID,
		MerchantID:           req.MerchantID,
		AmountCents:          req.AmountCents,
		Currency:             currency,
		Status:               status,
		PaymentMethod:        req.PaymentMethod,
		IPAddress:            req.IPAddress,
		DeviceFingerprint:    req.DeviceFingerprint,
		LocationCity:         req.LocationCity,
		LocationCountry:      req.LocationCountry,
		RiskScore:            fraudEval.RiskScore,
		RiskReasons:          fraudEval.Factors,
		CreatedAt:            time.Now(),
	}

	// 4. If Blocked, record and reject without moving funds
	if status == models.StatusBlocked {
		h.store.RecordTransaction(tx)
		h.publishEvent(tx)
		c.JSON(http.StatusForbidden, gin.H{
			"error":       "Transaction rejected by AI Fraud Engine",
			"transaction": tx,
		})
		return
	}

	// 5. Execute Double-Entry Ledger mutation (Atomic Debits = Credits)
	err := h.store.ExecuteDoubleEntry(tx)
	if err != nil {
		tx.Status = models.StatusFailed
		h.store.RecordTransaction(tx)
		h.publishEvent(tx)

		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"error":       err.Error(),
			"transaction": tx,
		})
		return
	}

	// 6. Publish to Redis Pub/Sub for Node.js real-time WebSocket broadcast
	h.publishEvent(tx)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Payment processed successfully",
		"transaction": tx,
	})
}

func (h *PaymentHandler) callFraudEngine(txID string, req models.PaymentRequest) models.FraudEvaluationResponse {
	payload := map[string]interface{}{
		"transaction_id":          txID,
		"user_id":                 req.SourceAccountID,
		"account_id":              req.SourceAccountID,
		"amount_cents":            req.AmountCents,
		"currency":                req.Currency,
		"merchant_id":             req.MerchantID,
		"merchant_category_code":  req.MerchantCategoryCode,
		"ip_address":              req.IPAddress,
		"device_fingerprint":      req.DeviceFingerprint,
		"location_city":           req.LocationCity,
		"location_country":        req.LocationCountry,
	}

	body, _ := json.Marshal(payload)
	client := &http.Client{Timeout: 2 * time.Second}
	resp, err := client.Post(fmt.Sprintf("%s/api/v1/fraud/evaluate", h.fraudURL), "application/json", bytes.NewBuffer(body))

	defaultEval := models.FraudEvaluationResponse{
		TransactionID:  txID,
		RiskScore:      15,
		Recommendation: "APPROVED",
		Factors:        []interface{}{},
	}

	if err != nil || resp.StatusCode != http.StatusOK {
		// Heuristic fallback if Python service is booting
		if req.AmountCents >= 500000 {
			defaultEval.RiskScore = 80
			defaultEval.Recommendation = "BLOCKED"
		}
		return defaultEval
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return defaultEval
	}

	var evalResp models.FraudEvaluationResponse
	if err := json.Unmarshal(respBytes, &evalResp); err != nil {
		return defaultEval
	}
	return evalResp
}

func (h *PaymentHandler) publishEvent(tx *models.Transaction) {
	if h.redisClient == nil {
		return
	}
	data, err := json.Marshal(tx)
	if err != nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()
	h.redisClient.Publish(ctx, "transactions:stream", data)
}

func (h *PaymentHandler) GetAccounts(c *gin.Context) {
	accounts := h.store.GetAllAccounts()
	c.JSON(http.StatusOK, accounts)
}

func (h *PaymentHandler) GetAccount(c *gin.Context) {
	id := c.Param("id")
	acc, err := h.store.GetAccount(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Account not found"})
		return
	}
	c.JSON(http.StatusOK, acc)
}

func (h *PaymentHandler) GetRecentTransactions(c *gin.Context) {
	txs := h.store.GetRecentTransactions(50)
	c.JSON(http.StatusOK, txs)
}
