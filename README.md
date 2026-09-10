# VaultGuard: Real-Time Payment Gateway & AI Fraud Detection Engine

[![CI/CD Pipeline](https://github.com/org/vaultguard/actions/workflows/ci.yml/badge.svg)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2051-61DAFB.svg)](https://reactnative.dev)
[![React Web](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![Go](https://img.shields.io/badge/Golang-1.22-00ADD8.svg)](https://go.dev)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%20FastAPI-3776AB.svg)](https://fastapi.tiangolo.com)
[![Node.js](https://img.shields.io/badge/Node.js-20%20%7C%20TypeScript-339933.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20Ledger-336791.svg)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7%20Pub%2FSub-DC382D.svg)](https://redis.io)

VaultGuard is an enterprise-grade, high-concurrency FinTech platform designed to demonstrate modern full-stack engineering across **mobile development (React Native)**, **web operations (React 18)**, **microservices (Golang, Python FastAPI, Node.js)**, **double-entry SQL ledger accounting**, and **Linux/DevOps automation**.

---

## Architecture Diagram

```
                           ┌────────────────────────┐      ┌─────────────────────────┐
                           │   React Native App     │      │   React Web Dashboard   │
                           │ (Consumer / Merchant)  │      │ (Risk Analyst War Room) │
                           └───────────┬────────────┘      └────────────┬────────────┘
                                       │                                │
                                       ▼                                ▼
                           ┌─────────────────────────────────────────────────────────┐
                           │          Nginx API Gateway / Reverse Proxy              │
                           └───────┬───────────────────┬───────────────────┬─────────┘
                                   │                   │                   │
                   ┌───────────────▼───────────┐       │       ┌───────────▼─────────────┐
                   │ Golang Payment Core       │       │       │ Node.js Gateway         │
                   │ - Ultra-fast checkout API │       │       │ - WebSockets live feed  │
                   │ - Idempotency & locks     │       │       │ - Merchant webhooks     │
                   │ - Ledger balance check    │       │       │ - JWT auth / sessions   │
                   └───────────────┬───────────┘       │       └───────────┬─────────────┘
                                   │                   │                   │
                                   ▼                   ▼                   ▼
                           ┌─────────────────────────────────────────────────────────┐
                           │             Redis Distributed Lock & Pub/Sub            │
                           └───────────────────────────┬─────────────────────────────┘
                                                       │
                                       ┌───────────────▼───────────┐
                                       │ Python FastAPI Engine     │
                                       │ - ML Risk Scoring (0-100) │
                                       │ - Velocity & Geo Anomaly  │
                                       │ - Automated Rule Engine   │
                                       └───────────────┬───────────┘
                                                       │
                                                       ▼
                                       ┌───────────────────────────┐
                                       │ PostgreSQL 16 Ledger      │
                                       │ - Double-Entry Accounting │
                                       │ - Immutable Audit Trail   │
                                       │ - Indexed Partition Logs  │
                                       └───────────────────────────┘
```

---

## Technical Stack & Division of Responsibilities

| Tier | Technology | Enterprise Responsibility |
|---|---|---|
| **Mobile Client** | **React Native (Expo / TypeScript)** | Mobile wallet app: QR code payments, biometric/PIN security, instant transfer, push notification alerts, offline pending transactions. |
| **Web Operations** | **React (Vite + TypeScript + Tailwind CSS)** | Risk Analyst War Room: Live real-time transaction monitor, interactive charts, fraud risk inspection, rule overrides (Approve/Block). |
| **Payment Ingestion** | **Golang 1.22 (Gin + Redis client)** | Sub-millisecond payment processing, cryptographic signature validation, idempotency checks via Redis, double-entry balance mutation. |
| **AI Fraud Engine** | **Python 3.10 (FastAPI + Scikit-Learn)** | Real-time risk scoring engine analyzing transaction velocity, sudden amount spikes, geographic distance deltas, and user behavioral baselines. |
| **Real-time Gateway** | **Node.js 20 (Express + WebSockets)** | Live transaction streaming to the risk desk, merchant webhook dispatching, notification delivery. |
| **Database & Cache** | **PostgreSQL 16 + Redis 7** | Strict ACID double-entry ledger (`sum(Debits) == sum(Credits)`), foreign keys, indices, Redis distributed locking and Pub/Sub message broker. |
| **DevOps & Linux** | **Docker Compose, Nginx, Bash, Makefile** | Multi-container orchestration, zero-downtime healthchecks, automated database migrations, Linux deployment and traffic simulation scripts. |

---

## Project Structure

```
vaultguard/
├── docker-compose.yml             # Full 7-service orchestration
├── Makefile                       # Developer automation menu
├── nginx/
│   └── nginx.conf                 # Edge reverse proxy & rate limiting
├── database/
│   ├── init.sql                   # Double-entry ledger schema & indices
│   └── seed.sql                   # Pre-seeded test accounts & merchants
├── services/
│   ├── core-go/                   # Golang Payment Ingestion & Ledger Core
│   │   ├── cmd/server/main.go
│   │   ├── internal/handlers/     # Payment API & Idempotency
│   │   ├── internal/ledger/       # Atomic double-entry balancing
│   │   ├── internal/models/       # Go structs & data contracts
│   │   ├── go.mod
│   │   └── Dockerfile
│   ├── fraud-python/              # Python FastAPI AI Fraud Scoring Engine
│   │   ├── app/main.py            # REST API endpoints
│   │   ├── app/detector.py        # ML anomaly models & heuristic rules
│   │   ├── app/schemas.py         # Pydantic models
│   │   ├── tests/                 # Pytest test suite
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── gateway-node/              # Node.js WebSocket & Webhook Gateway
│       ├── src/index.ts           # Express server & Redis subscriber
│       ├── src/websocket.ts       # Real-time WebSocket broadcasting
│       ├── src/webhooks.ts        # HMAC-signed webhook dispatcher
│       ├── package.json
│       └── Dockerfile
├── apps/
│   ├── web/                       # React Web Risk Operations Dashboard
│   │   ├── src/App.tsx            # Main operations command center
│   │   ├── src/components/        # Charts, Live feeds, Triage modal, Simulator
│   │   ├── package.json
│   │   └── Dockerfile
│   └── mobile/                    # React Native (Expo) Mobile Wallet
│       ├── App.tsx                # Consumer wallet entrypoint
│       ├── src/components/        # Balance card, Quick transfer, QR modal, Activity
│       ├── app.json
│       └── package.json
├── scripts/
│   ├── healthcheck.sh             # Linux service healthcheck diagnostic
│   ├── simulate_traffic.py        # FinTech continuous transaction generator
│   └── simulate_traffic.sh        # Bash runner
└── .github/workflows/
    └── ci.yml                     # Multi-job automated CI pipeline
```

---

## Quick Start Guide

### Option 1: Run with Docker Compose (Recommended)
Launch the entire 7-container cluster with a single command:

```bash
docker compose up -d --build
```

Once started:
- **React Web Operations War Room:** `http://localhost:3000`
- **Nginx Unified Gateway:** `http://localhost`
- **Golang Payment Core:** `http://localhost:8080/health`
- **Python AI Fraud Engine Docs:** `http://localhost:8000/docs`
- **Node.js WebSocket Hub:** `ws://localhost:5000/ws`

### Option 2: Run Microservices Individually (Local Development)

#### 1. Python AI Fraud Engine
```bash
cd services/fraud-python
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

#### 2. Golang Payment Core
```bash
cd services/core-go
go run cmd/server/main.go
```

#### 3. Node.js WebSocket Gateway
```bash
cd services/gateway-node
npm install
npm run dev
```

#### 4. React Web Operations Dashboard
```bash
cd apps/web
npm install
npm run dev
```

#### 5. React Native Mobile Wallet
```bash
cd apps/mobile
npm install
npx expo start
```

---

## Simulating Traffic & Testing Fraud Detection

To demonstrate live transaction ingestion, machine learning scoring, and WebSocket streaming, execute the built-in simulator:

```bash
# Run via Python
python scripts/simulate_traffic.py

# Or via Makefile on Linux / macOS
make traffic
```

The simulator injects realistic scenarios into the pipeline:
1. **Clean Routine Payments ($12 - $85)** &rarr; `Score < 25`, **Approved**.
2. **Elevated Purchases ($1,500+)** &rarr; `Score 45 - 65`, **Flagged for Review**.
3. **Velocity Bursts (5 rapid payments in seconds)** &rarr; `Score > 75`, **Blocked**.
4. **Offshore Gambling & Spoofed Proxies** &rarr; `Score > 85`, **Blocked & Frozen**.

Open `http://localhost:3000` to watch the live transaction feed and risk analytics update in real time.
