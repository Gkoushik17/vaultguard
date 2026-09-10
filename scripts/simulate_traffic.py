#!/usr/bin/env python3
"""
VaultGuard Real-Time FinTech Traffic & Threat Simulator
Generates continuous mixed-profile transactions:
- 70% Routine clean payments (Groceries, Coffee, Rideshare)
- 15% High-value outlier purchases (Electronics, Luxury)
- 10% Velocity burst attacks (Rapid consecutive pings)
- 5% High-risk fraudulent activity (Gambling MCC 7995, Crypto bridges, Proxy IPs)
"""

import time
import random
import uuid
import sys
import json
try:
    import urllib.request
except ImportError:
    pass

API_URL = "http://localhost:8080/api/v1/payments/process"
GATEWAY_URL = "http://localhost:5000/api/events/broadcast"

C_GREEN = "\033[92m"
C_YELLOW = "\033[93m"
C_RED = "\033[91m"
C_CYAN = "\033[96m"
C_RESET = "\033[0m"

MERCHANTS = [
    {"id": "m0000000-0000-0000-0000-000000000002", "name": "WholeGreen Groceries", "mcc": "5411"},
    {"id": "m0000000-0000-0000-0000-000000000001", "name": "Apex Electronics Tech", "mcc": "5732"},
    {"id": "m0000000-0000-0000-0000-000000000004", "name": "CloudStream Subscriptions", "mcc": "4899"},
    {"id": "m0000000-0000-0000-0000-000000000003", "name": "HighRoller Global Casino", "mcc": "7995"},
]

CITIES = [
    ("New York", "US"),
    ("San Francisco", "US"),
    ("London", "GB"),
    ("Tokyo", "JP"),
    ("Berlin", "DE"),
    ("Curacao", "CW")
]

def make_request(url: str, data: dict):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            return json.loads(resp.read().decode("utf-8")), resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return json.loads(body), e.code
        except Exception:
            return {"error": str(e)}, e.code
    except Exception as e:
        return None, 0


def generate_transaction():
    rand = random.random()
    city, country = random.choice(CITIES[:3])
    source_acc = "a0000000-0000-0000-0000-000000000002" # Alice

    # 1. High Risk Gambling / Fraud Scenario (5%)
    if rand < 0.05:
        merchant = MERCHANTS[3] # Casino
        city, country = ("Curacao", "CW")
        amount = random.randint(600000, 950000) # $6,000 - $9,500
        payment_method = "CRYPTO_BRIDGE"
        source_acc = "a0000000-0000-0000-0000-000000000004" # Suspect
        fp = "fp_spoofed_proxy"

    # 2. Velocity Burst Scenario (10%)
    elif rand < 0.15:
        merchant = random.choice(MERCHANTS[:2])
        amount = random.randint(3000, 8000) # $30 - $80
        payment_method = "STORED_CARD"
        source_acc = "a0000000-0000-0000-0000-000000000004" # Suspect
        fp = "fp_burst_session"

    # 3. High-Value Outlier (15%)
    elif rand < 0.30:
        merchant = MERCHANTS[1] # Electronics
        amount = random.randint(180000, 350000) # $1,800 - $3,500
        payment_method = "VISA_CREDIT"
        fp = "fp_macbook_safari"

    # 4. Standard Routine Payment (70%)
    else:
        merchant = random.choice([MERCHANTS[0], MERCHANTS[2]])
        amount = random.randint(1200, 8500) # $12 - $85
        payment_method = random.choice(["APPLE_PAY", "GOOGLE_PAY", "VISA_DEBIT"])
        fp = "fp_iphone_alice"

    return {
        "idempotency_key": f"sim_{uuid.uuid4().hex[:12]}",
        "source_account_id": source_acc,
        "destination_account_id": "a0000000-0000-0000-0000-000000000001",
        "merchant_id": merchant["id"],
        "merchant_category_code": merchant["mcc"],
        "amount_cents": amount,
        "currency": "USD",
        "payment_method": payment_method,
        "device_fingerprint": fp,
        "location_city": city,
        "location_country": country
    }


def main():
    print(f"{C_CYAN}=================================================================={C_RESET}")
    print(f"{C_CYAN}         VaultGuard Autonomous FinTech Traffic Simulator          {C_RESET}")
    print(f"{C_CYAN}=================================================================={C_RESET}")
    print("Connecting to backend pipeline...\n")

    count = 0
    try:
        while True:
            tx_data = generate_transaction()
            res, code = make_request(API_URL, tx_data)

            if code == 0:
                # If Go Core is not running on 8080, try Node Gateway broadcast
                res, code = make_request(GATEWAY_URL, tx_data)

            count += 1
            amount_usd = f"${tx_data['amount_cents'] / 100:.2f}"
            
            if res and "transaction" in res:
                tx = res["transaction"]
                status = tx.get("status", "UNKNOWN")
                risk = tx.get("risk_score", 0)
                reasons = tx.get("risk_reasons", [])
            else:
                status = "OFFLINE_SIM"
                risk = 85 if tx_data["amount_cents"] > 500000 else 12
                reasons = []

            # Format status color
            if status == "APPROVED":
                badge = f"{C_GREEN}[APPROVED]{C_RESET}"
            elif status == "BLOCKED":
                badge = f"{C_RED}[BLOCKED - FRAUD INTERCEPT]{C_RESET}"
            else:
                badge = f"{C_YELLOW}[FLAGGED FOR REVIEW]{C_RESET}"

            reason_str = ""
            if reasons and len(reasons) > 0:
                if isinstance(reasons[0], dict):
                    reason_str = f" | Signal: {reasons[0].get('code', '')}"

            print(f"#{count:03d} {badge} {amount_usd:>9} | Method: {tx_data['payment_method']:<14} | Risk: {risk:>3}/100 {reason_str}")

            time.sleep(random.uniform(0.8, 2.0))

    except KeyboardInterrupt:
        print(f"\n{C_CYAN}Simulator terminated by user. Total transactions simulated: {count}{C_RESET}")


if __name__ == "__main__":
    main()
