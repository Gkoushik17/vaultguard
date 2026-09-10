from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class TransactionEvaluationRequest(BaseModel):
    transaction_id: str
    user_id: str
    account_id: str
    amount_cents: int = Field(gt=0, description="Amount in cents")
    currency: str = "USD"
    merchant_id: str
    merchant_category_code: str = "5411"  # Default grocery
    ip_address: Optional[str] = "127.0.0.1"
    device_fingerprint: Optional[str] = "fp_unknown"
    location_city: Optional[str] = "New York"
    location_country: Optional[str] = "US"
    timestamp: Optional[datetime] = None

class RiskFactor(BaseModel):
    code: str
    description: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    weight: float

class TransactionEvaluationResponse(BaseModel):
    transaction_id: str
    risk_score: int  # 0 to 100
    recommendation: str  # APPROVED, FLAGGED_FOR_REVIEW, BLOCKED
    confidence: float
    factors: List[RiskFactor]
    velocity_count_last_5min: int
    evaluated_at: datetime
