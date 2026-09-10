from datetime import datetime, timezone
from typing import List, Tuple, Dict
from collections import defaultdict
import time
from .schemas import TransactionEvaluationRequest, RiskFactor

class FraudDetectionEngine:
    """
    Real-Time AI & Behavioral Fraud Scoring Engine
    Evaluates financial transactions against multiple risk dimensions:
    1. Transaction Velocity & Rapid Burst
    2. Magnitude Outlier (Amount Deviation)
    3. High-Risk Merchant Category (MCC)
    4. Geographic Inconsistency / Impossible Travel
    5. Suspicious Device / Network Fingerprint
    """

    HIGH_RISK_MCCS: Dict[str, Tuple[str, float]] = {
        "7995": ("Online Gambling / Betting", 28.0),
        "6051": ("Cryptocurrency / Quasi-Cash Wire", 32.0),
        "7273": ("Dating / Escort Services", 20.0),
        "5933": ("Pawn Shops & High-Liquidity Goods", 18.0)
    }

    # Baseline typical average amount in cents ($75.00)
    TYPICAL_AMOUNT_CENTS = 7500 

    def __init__(self):
        # In-memory velocity cache: user_id -> list of timestamps
        self.user_transactions: Dict[str, List[float]] = defaultdict(list)
        # Last known location: user_id -> (city, country, timestamp)
        self.user_locations: Dict[str, Tuple[str, str, float]] = {}

    def evaluate(self, tx: TransactionEvaluationRequest) -> Tuple[int, str, float, List[RiskFactor], int]:
        now = time.time()
        factors: List[RiskFactor] = []
        raw_score = 0.0

        # --- 1. Velocity Analysis (Transactions in last 5 minutes) ---
        user_history = self.user_transactions[tx.user_id]
        # Prune transactions older than 300 seconds (5 minutes)
        valid_timestamps = [t for t in user_history if now - t <= 300]
        self.user_transactions[tx.user_id] = valid_timestamps + [now]
        velocity_count = len(self.user_transactions[tx.user_id])

        if velocity_count >= 5:
            factors.append(RiskFactor(
                code="VELOCITY_EXTREME",
                description=f"Rapid velocity burst: {velocity_count} payments in 5 minutes",
                severity="CRITICAL",
                weight=45.0
            ))
            raw_score += 45.0
        elif velocity_count >= 3:
            factors.append(RiskFactor(
                code="VELOCITY_ELEVATED",
                description=f"Elevated frequency: {velocity_count} payments in 5 minutes",
                severity="MEDIUM",
                weight=20.0
            ))
            raw_score += 20.0

        # --- 2. Magnitude / Outlier Analysis ---
        amount = tx.amount_cents
        if amount >= 500000: # >= $5,000.00
            factors.append(RiskFactor(
                code="AMOUNT_EXCESSIVE",
                description=f"High-value transaction: ${amount / 100:.2f} exceeds standard risk threshold",
                severity="HIGH",
                weight=35.0
            ))
            raw_score += 35.0
        elif amount >= 150000: # >= $1,500.00
            factors.append(RiskFactor(
                code="AMOUNT_ABOVE_AVERAGE",
                description=f"Elevated purchase amount: ${amount / 100:.2f}",
                severity="MEDIUM",
                weight=15.0
            ))
            raw_score += 15.0

        # --- 3. Merchant Category Code (MCC) Analysis ---
        mcc = str(tx.merchant_category_code)
        if mcc in self.HIGH_RISK_MCCS:
            desc, weight = self.HIGH_RISK_MCCS[mcc]
            factors.append(RiskFactor(
                code=f"MCC_{mcc}",
                description=f"High-risk merchant industry: {desc} (MCC {mcc})",
                severity="HIGH",
                weight=weight
            ))
            raw_score += weight

        # --- 4. Impossible Travel / Geo Velocity ---
        city = tx.location_city or "Unknown"
        country = tx.location_country or "US"
        if tx.user_id in self.user_locations:
            prev_city, prev_country, prev_time = self.user_locations[tx.user_id]
            time_diff = now - prev_time
            if prev_country != country and time_diff < 3600: # different country under 1 hour
                factors.append(RiskFactor(
                    code="GEO_IMPOSSIBLE_TRAVEL",
                    description=f"Impossible physical travel: {prev_city}, {prev_country} to {city}, {country} in {int(time_diff / 60)} mins",
                    severity="CRITICAL",
                    weight=50.0
                ))
                raw_score += 50.0

        self.user_locations[tx.user_id] = (city, country, now)

        # --- 5. Device Fingerprint Anomaly ---
        if tx.device_fingerprint and "tor" in tx.device_fingerprint.lower() or tx.device_fingerprint == "fp_spoofed":
            factors.append(RiskFactor(
                code="DEVICE_SUSPICIOUS",
                description="Transaction originated from suspicious/anonymized network proxy",
                severity="CRITICAL",
                weight=40.0
            ))
            raw_score += 40.0

        # Normalize score between 0 and 100
        final_score = int(min(100.0, max(0.0, raw_score)))

        # Determine Recommendation
        if final_score >= 75:
            recommendation = "BLOCKED"
        elif final_score >= 40:
            recommendation = "FLAGGED_FOR_REVIEW"
        else:
            recommendation = "APPROVED"

        confidence = round(0.85 + (len(factors) * 0.03), 2)
        confidence = min(0.99, confidence)

        return final_score, recommendation, confidence, factors, velocity_count


# Global singleton instance
engine = FraudDetectionEngine()
