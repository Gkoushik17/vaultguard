import os
import json
import logging
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .schemas import TransactionEvaluationRequest, TransactionEvaluationResponse
from .detector import engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("vaultguard-fraud")

app = FastAPI(
    title="VaultGuard AI Fraud Engine",
    version="1.0.0",
    description="Real-time ML & Behavioral Fraud Scoring Microservice for Financial Transactions"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

redis_client = None
try:
    import redis
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, socket_timeout=1.0)
    redis_client.ping()
    logger.info("Connected to Redis event bus")
except Exception as e:
    logger.warning(f"Redis not available on startup ({e}). Continuing in standalone mode.")
    redis_client = None


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "fraud-python",
        "redis_connected": redis_client is not None,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.post(
    "/api/v1/fraud/evaluate",
    response_model=TransactionEvaluationResponse,
    status_code=status.HTTP_200_OK
)
def evaluate_transaction(payload: TransactionEvaluationRequest):
    logger.info(f"Evaluating transaction {payload.transaction_id} | Amount: ${payload.amount_cents / 100:.2f} | MCC: {payload.merchant_category_code}")

    score, recommendation, confidence, factors, velocity = engine.evaluate(payload)
    eval_time = datetime.now(timezone.utc)

    response = TransactionEvaluationResponse(
        transaction_id=payload.transaction_id,
        risk_score=score,
        recommendation=recommendation,
        confidence=confidence,
        factors=factors,
        velocity_count_last_5min=velocity,
        evaluated_at=eval_time
    )

    # Publish evaluation event to Redis Pub/Sub for Node.js real-time gateway
    if redis_client:
        try:
            event_payload = json.dumps({
                "type": "FRAUD_EVALUATED",
                "transaction_id": payload.transaction_id,
                "risk_score": score,
                "recommendation": recommendation,
                "factors": [f.model_dump() for f in factors],
                "evaluated_at": eval_time.isoformat()
            })
            redis_client.publish("fraud:evaluations", event_payload)
        except Exception as err:
            logger.error(f"Failed to publish to Redis: {err}")

    return response


@app.get("/api/v1/fraud/rules")
def get_active_rules():
    return {
        "rules": [
            {"code": "VELOCITY_BURST", "threshold": "5 tx / 5 min", "severity": "CRITICAL", "weight": 45},
            {"code": "AMOUNT_EXCESSIVE", "threshold": "> $5,000.00", "severity": "HIGH", "weight": 35},
            {"code": "MCC_RESTRICTED", "threshold": "Gambling / Crypto wire", "severity": "HIGH", "weight": 32},
            {"code": "GEO_IMPOSSIBLE_TRAVEL", "threshold": "International change < 1 hr", "severity": "CRITICAL", "weight": 50},
            {"code": "DEVICE_ANOMALY", "threshold": "TOR / Anonymized Proxy", "severity": "HIGH", "weight": 40}
        ]
    }
