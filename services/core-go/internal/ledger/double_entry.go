package ledger

import (
	"errors"
	"fmt"
	"sync"
	"time"
	"vaultguard/core-go/internal/models"

	"github.com/google/uuid"
)

var (
	ErrInsufficientFunds   = errors.New("insufficient balance in source account")
	ErrAccountNotFound     = errors.New("specified account does not exist")
	ErrAccountInactive     = errors.New("account is not active")
	ErrUnbalancedEntry     = errors.New("double-entry violation: debits must equal credits")
	ErrDuplicateIdempotent = errors.New("duplicate request detected: transaction already processed")
)

type LedgerStore struct {
	mu           sync.RWMutex
	accounts     map[string]*models.Account
	transactions map[string]*models.Transaction
	idempotency  map[string]*models.Transaction
	entries      []*models.LedgerEntry
}

func NewLedgerStore() *LedgerStore {
	store := &LedgerStore{
		accounts:     make(map[string]*models.Account),
		transactions: make(map[string]*models.Transaction),
		idempotency:  make(map[string]*models.Transaction),
		entries:      make([]*models.LedgerEntry, 0),
	}

	// Seed baseline system accounts (aligns with database/seed.sql)
	store.accounts["a0000000-0000-0000-0000-000000000001"] = &models.Account{
		ID:            "a0000000-0000-0000-0000-000000000001",
		AccountNumber: "VG-SYS-RESERVE-01",
		HolderName:    "VaultGuard Liquidity Reserve",
		AccountType:   models.AccountEquity,
		Currency:      "USD",
		BalanceCents:  1000000000, // $10,000,000.00
		Status:        "ACTIVE",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	store.accounts["a0000000-0000-0000-0000-000000000002"] = &models.Account{
		ID:            "a0000000-0000-0000-0000-000000000002",
		AccountNumber: "VG-USR-ALICE-101",
		HolderName:    "Alice Johnson (Verified)",
		AccountType:   models.AccountAsset,
		Currency:      "USD",
		BalanceCents:  500000, // $5,000.00
		Status:        "ACTIVE",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	store.accounts["a0000000-0000-0000-0000-000000000003"] = &models.Account{
		ID:            "a0000000-0000-0000-0000-000000000003",
		AccountNumber: "VG-USR-BOB-102",
		HolderName:    "Bob Smith (Consumer)",
		AccountType:   models.AccountAsset,
		Currency:      "USD",
		BalanceCents:  250000, // $2,500.00
		Status:        "ACTIVE",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	store.accounts["a0000000-0000-0000-0000-000000000004"] = &models.Account{
		ID:            "a0000000-0000-0000-0000-000000000004",
		AccountNumber: "VG-USR-SUSPECT-999",
		HolderName:    "Compromised Test Account",
		AccountType:   models.AccountAsset,
		Currency:      "USD",
		BalanceCents:  1500000, // $15,000.00
		Status:        "ACTIVE",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	return store
}

func (s *LedgerStore) GetAccount(id string) (*models.Account, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	acc, exists := s.accounts[id]
	if !exists {
		return nil, ErrAccountNotFound
	}
	return acc, nil
}

func (s *LedgerStore) GetAllAccounts() []*models.Account {
	s.mu.RLock()
	defer s.mu.RUnlock()

	list := make([]*models.Account, 0, len(s.accounts))
	for _, a := range s.accounts {
		list = append(list, a)
	}
	return list
}

func (s *LedgerStore) CheckIdempotency(key string) (*models.Transaction, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tx, found := s.idempotency[key]
	return tx, found
}

func (s *LedgerStore) ExecuteDoubleEntry(
	tx *models.Transaction,
) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	source, ok := s.accounts[tx.SourceAccountID]
	if !ok {
		return fmt.Errorf("%w: source account %s", ErrAccountNotFound, tx.SourceAccountID)
	}
	dest, ok := s.accounts[tx.DestinationAccountID]
	if !ok {
		return fmt.Errorf("%w: destination account %s", ErrAccountNotFound, tx.DestinationAccountID)
	}

	if source.Status != "ACTIVE" || dest.Status != "ACTIVE" {
		return ErrAccountInactive
	}

	if source.BalanceCents < tx.AmountCents {
		return ErrInsufficientFunds
	}

	// 1. Debit Source Account (Reduce asset or increase expense)
	source.BalanceCents -= tx.AmountCents
	source.UpdatedAt = time.Now()

	debitEntry := &models.LedgerEntry{
		ID:             uuid.New().String(),
		TransactionID:  tx.ID,
		AccountID:      source.ID,
		Direction:      "DEBIT",
		AmountCents:    tx.AmountCents,
		Currency:       tx.Currency,
		SequenceNumber: int64(len(s.entries) + 1),
		CreatedAt:      time.Now(),
	}

	// 2. Credit Destination Account (Increase asset or liability)
	dest.BalanceCents += tx.AmountCents
	dest.UpdatedAt = time.Now()

	creditEntry := &models.LedgerEntry{
		ID:             uuid.New().String(),
		TransactionID:  tx.ID,
		AccountID:      dest.ID,
		Direction:      "CREDIT",
		AmountCents:    tx.AmountCents,
		Currency:       tx.Currency,
		SequenceNumber: int64(len(s.entries) + 2),
		CreatedAt:      time.Now(),
	}

	// Double-entry validation: sum(Debits) == sum(Credits)
	if debitEntry.AmountCents != creditEntry.AmountCents {
		// Rollback in-memory balances
		source.BalanceCents += tx.AmountCents
		dest.BalanceCents -= tx.AmountCents
		return ErrUnbalancedEntry
	}

	// Record entries and transaction
	s.entries = append(s.entries, debitEntry, creditEntry)
	now := time.Now()
	tx.SettledAt = &now
	s.transactions[tx.ID] = tx
	s.idempotency[tx.IdempotencyKey] = tx

	return nil
}

func (s *LedgerStore) RecordTransaction(tx *models.Transaction) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.transactions[tx.ID] = tx
	s.idempotency[tx.IdempotencyKey] = tx
}

func (s *LedgerStore) GetRecentTransactions(limit int) []*models.Transaction {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]*models.Transaction, 0, len(s.transactions))
	for _, tx := range s.transactions {
		result = append(result, tx)
	}

	// Return most recent first
	for i, j := 0, len(result)-1; i < j; i, j = i+1, j-1 {
		result[i], result[j] = result[j], result[i]
	}

	if limit > 0 && len(result) > limit {
		return result[:limit]
	}
	return result
}
