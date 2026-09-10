import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { SimulatorPanel } from './components/SimulatorPanel';
import { FraudAnalyticsChart } from './components/FraudAnalyticsChart';
import { LiveTransactionFeed } from './components/LiveTransactionFeed';
import { RiskDetailModal } from './components/RiskDetailModal';
import { Transaction, SystemStats } from './types';

// Default mock initial data to ensure dashboard displays rich state instantly
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_demo_019a3b2c',
    idempotency_key: 'idemp_demo_01',
    source_account_id: 'a0000000-0000-0000-0000-000000000002',
    destination_account_id: 'a0000000-0000-0000-0000-000000000001',
    merchant_id: 'm0000000-0000-0000-0000-000000000002',
    amount_cents: 4250,
    currency: 'USD',
    status: 'APPROVED',
    payment_method: 'APPLE_PAY',
    location_city: 'San Francisco',
    location_country: 'US',
    risk_score: 12,
    risk_reasons: [],
    created_at: new Date(Date.now() - 1000 * 30).toISOString()
  },
  {
    id: 'tx_demo_019a3b2d',
    idempotency_key: 'idemp_demo_02',
    source_account_id: 'a0000000-0000-0000-0000-000000000002',
    destination_account_id: 'a0000000-0000-0000-0000-000000000001',
    merchant_id: 'm0000000-0000-0000-0000-000000000001',
    amount_cents: 189900,
    currency: 'USD',
    status: 'FLAGGED_FOR_REVIEW',
    payment_method: 'VISA_CREDIT',
    location_city: 'New York',
    location_country: 'US',
    risk_score: 48,
    risk_reasons: [
      {
        code: 'AMOUNT_ABOVE_AVERAGE',
        description: 'Elevated purchase amount: $1899.00 exceeds standard velocity profile',
        severity: 'MEDIUM',
        weight: 15
      }
    ],
    created_at: new Date(Date.now() - 1000 * 90).toISOString()
  },
  {
    id: 'tx_demo_019a3b2e',
    idempotency_key: 'idemp_demo_03',
    source_account_id: 'a0000000-0000-0000-0000-000000000004',
    destination_account_id: 'a0000000-0000-0000-0000-000000000001',
    merchant_id: 'm0000000-0000-0000-0000-000000000003',
    amount_cents: 750000,
    currency: 'USD',
    status: 'BLOCKED',
    payment_method: 'CRYPTO_BRIDGE',
    location_city: 'Curacao',
    location_country: 'CW',
    risk_score: 85,
    risk_reasons: [
      {
        code: 'AMOUNT_EXCESSIVE',
        description: 'High-value transaction: $7500.00 exceeds standard risk threshold',
        severity: 'HIGH',
        weight: 35
      },
      {
        code: 'MCC_7995',
        description: 'High-risk merchant industry: Online Gambling / Betting (MCC 7995)',
        severity: 'HIGH',
        weight: 28
      }
    ],
    created_at: new Date(Date.now() - 1000 * 180).toISOString()
  }
];

export const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    total_transactions: 3,
    total_volume_cents: 944150,
    approved_count: 1,
    blocked_count: 1,
    flagged_count: 1,
    tps: 3,
    average_risk_score: 48
  });

  const wsRef = useRef<WebSocket | null>(null);

  // Initialize Real-time WebSocket connection to Node.js Gateway
  useEffect(() => {
    const wsUrl = 'ws://localhost:5000/ws';
    let socket: WebSocket;

    const connect = () => {
      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          console.log('[Web] Connected to Node.js WebSocket Hub');
          setWsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'TRANSACTION_CREATED') {
              const newTx: Transaction = msg.data;
              setTransactions((prev) => [newTx, ...prev.slice(0, 100)]);
              updateStats(newTx);
            } else if (msg.type === 'TRANSACTION_STATUS_UPDATED') {
              const { transaction_id, new_status } = msg.data;
              setTransactions((prev) =>
                prev.map((t) => (t.id === transaction_id ? { ...t, status: new_status } : t))
              );
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        socket.onclose = () => {
          setWsConnected(false);
          setTimeout(connect, 4000); // Auto reconnect
        };

        socket.onerror = () => {
          setWsConnected(false);
        };
      } catch (e) {
        setWsConnected(false);
      }
    };

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const updateStats = (newTx: Transaction) => {
    setStats((prev) => {
      const total = prev.total_transactions + 1;
      return {
        total_transactions: total,
        total_volume_cents: prev.total_volume_cents + newTx.amount_cents,
        approved_count: prev.approved_count + (newTx.status === 'APPROVED' ? 1 : 0),
        blocked_count: prev.blocked_count + (newTx.status === 'BLOCKED' ? 1 : 0),
        flagged_count: prev.flagged_count + (newTx.status === 'FLAGGED_FOR_REVIEW' ? 1 : 0),
        tps: Math.floor(Math.random() * 5) + 2,
        average_risk_score: Math.round((prev.average_risk_score * prev.total_transactions + newTx.risk_score) / total)
      };
    });
  };

  // Trigger payment via Go Payment Core or Node.js Gateway
  const handleTriggerPayment = async (payload: any) => {
    try {
      // First attempt to call Go Core directly
      const res = await fetch('http://localhost:8080/api/v1/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.transaction) {
        setTransactions((prev) => [data.transaction, ...prev.slice(0, 100)]);
        updateStats(data.transaction);
      }
    } catch (e) {
      // Local standalone simulation fallback (if services aren't running yet)
      const isHigh = payload.amount_cents > 200000;
      const isExtreme = payload.amount_cents >= 500000 || payload.merchant_category_code === '7995';
      const riskScore = isExtreme ? Math.floor(Math.random() * 20) + 80 : isHigh ? 52 : Math.floor(Math.random() * 20) + 10;
      const status = riskScore >= 75 ? 'BLOCKED' : riskScore >= 40 ? 'FLAGGED_FOR_REVIEW' : 'APPROVED';

      const simulatedTx: Transaction = {
        id: 'tx_local_' + Math.random().toString(36).substring(2, 9),
        idempotency_key: payload.idempotency_key,
        source_account_id: payload.source_account_id,
        destination_account_id: payload.destination_account_id,
        merchant_id: payload.merchant_id,
        amount_cents: payload.amount_cents,
        currency: payload.currency || 'USD',
        status: status,
        payment_method: payload.payment_method || 'DIGITAL_WALLET',
        location_city: payload.location_city || 'San Francisco',
        location_country: payload.location_country || 'US',
        risk_score: riskScore,
        risk_reasons: isExtreme
          ? [{ code: 'AMOUNT_EXCESSIVE', description: 'Large dollar amount detected', severity: 'HIGH', weight: 35 }]
          : isHigh
          ? [{ code: 'AMOUNT_ABOVE_AVERAGE', description: 'Elevated purchase amount', severity: 'MEDIUM', weight: 15 }]
          : [],
        created_at: new Date().toISOString()
      };

      setTransactions((prev) => [simulatedTx, ...prev.slice(0, 100)]);
      updateStats(simulatedTx);
    }
  };

  const handleTriage = async (id: string, decision: 'APPROVE' | 'BLOCK', notes?: string) => {
    try {
      await fetch(`http://localhost:5000/api/alerts/${id}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes })
      });
    } catch (err) {
      console.warn('Backend triage offline, updating local state');
    }

    const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'BLOCKED';
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Header wsConnected={wsConnected} tps={stats.tps} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <MetricsBar stats={stats} />
        <SimulatorPanel onTriggerPayment={handleTriggerPayment} />
        <FraudAnalyticsChart transactions={transactions} />
        <LiveTransactionFeed 
          transactions={transactions} 
          onSelectTransaction={(tx) => setSelectedTx(tx)} 
        />
      </main>

      <footer className="border-t border-slate-900 bg-[#070b12] py-4 text-center text-xs text-slate-500 font-mono">
        VaultGuard Autonomous FinTech Architecture &copy; 2026 &bull; Go 1.22 &bull; Python 3.10 &bull; Node.js 20 &bull; PostgreSQL 16 &bull; React 18 &bull; React Native
      </footer>

      {selectedTx && (
        <RiskDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onTriage={handleTriage}
        />
      )}
    </div>
  );
};
