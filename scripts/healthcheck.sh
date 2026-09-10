#!/usr/bin/env bash
# VaultGuard Multi-Service Linux Health Check Script

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}     VaultGuard Production Health Diagnostic        ${NC}"
echo -e "${CYAN}====================================================${NC}"

check_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}

    echo -n "Checking $name ($url)... "
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "$url" || echo "000")

    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}[ONLINE - HTTP $response]${NC}"
    else
        echo -e "${RED}[FAILED - HTTP $response]${NC}"
    fi
}

check_endpoint "Golang Payment Core" "http://localhost:8080/health" 200
check_endpoint "Python AI Fraud Engine" "http://localhost:8000/health" 200
check_endpoint "Node.js Real-time Hub" "http://localhost:5000/health" 200
check_endpoint "React Web Operations" "http://localhost:3000" 200
check_endpoint "Nginx Reverse Proxy" "http://localhost/health" 200

echo -e "\n${GREEN}Diagnostic sweep complete.${NC}"
