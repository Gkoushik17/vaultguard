import pytest
from app.detector import FraudDetectionEngine
from app.schemas import TransactionEvaluationRequest

def test_clean_transaction_approval():
    engine = FraudDetectionEngine()
    req = TransactionEvaluationRequest(
        transaction_id="tx_clean_1",
        user_id="usr_normal",
        account_id="acc_normal",
        amount_cents=3500, # $35.00
        merchant_id="m_grocery",
        merchant_category_code="5411", # Groceries
        location_city="San Francisco",
        location_country="US"
    )
    score, rec, conf, factors, velocity = engine.evaluate(req)
    assert score < 40
    assert rec == "APPROVED"
    assert len(factors) == 0

def test_high_amount_flags_review():
    engine = FraudDetectionEngine()
    req = TransactionEvaluationRequest(
        transaction_id="tx_high_val",
        user_id="usr_rich",
        account_id="acc_rich",
        amount_cents=200000, # $2,000.00
        merchant_id="m_luxury",
        merchant_category_code="5411"
    )
    score, rec, conf, factors, velocity = engine.evaluate(req)
    assert any(f.code == "AMOUNT_ABOVE_AVERAGE" for f in factors)

def test_extreme_amount_and_gambling_blocks():
    engine = FraudDetectionEngine()
    req = TransactionEvaluationRequest(
        transaction_id="tx_gambling_whale",
        user_id="usr_whale",
        account_id="acc_whale",
        amount_cents=800000, # $8,000.00
        merchant_id="m_casino",
        merchant_category_code="7995" # Gambling
    )
    score, rec, conf, factors, velocity = engine.evaluate(req)
    assert score >= 60
    assert any(f.code == "AMOUNT_EXCESSIVE" for f in factors)
    assert any(f.code == "MCC_7995" for f in factors)
