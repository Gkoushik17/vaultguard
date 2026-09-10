# VaultGuard FinTech Platform Makefile
.PHONY: help up down restart logs health test traffic clean

help:
	@echo "VaultGuard Automation Menu:"
	@echo "  make up       - Start all microservices in Docker"
	@echo "  make down     - Stop all containers"
	@echo "  make restart  - Restart the complete stack"
	@echo "  make logs     - View real-time container logs"
	@echo "  make health   - Run Linux service health checks"
	@echo "  make test     - Run test suites across services"
	@echo "  make traffic  - Run continuous FinTech traffic simulator"

up:
	docker compose up -d --build

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f

health:
	bash scripts/healthcheck.sh

test:
	@echo "Running Python Fraud Engine Unit Tests..."
	python -m pytest services/fraud-python/tests/
	@echo "Running TypeScript Build Verification..."
	cd services/gateway-node && npm run build
	cd apps/web && npm run build

traffic:
	python scripts/simulate_traffic.py

clean:
	docker compose down -v --remove-orphans
