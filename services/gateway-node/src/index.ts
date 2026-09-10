import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import { Redis } from 'ioredis';
import { RealtimeHub } from './websocket.js';
import { WebhookDispatcher } from './webhooks.js';
import { TransactionEvent, SystemStats } from './types.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const realtimeHub = new RealtimeHub(server);
const webhookDispatcher = new WebhookDispatcher();

// In-memory stats and live transaction buffer
const recentTransactions: TransactionEvent[] = [];
let totalVolumeCents = 0;
let approvedCount = 0;
let blockedCount = 0;
let flaggedCount = 0;

// Connect to Redis Pub/Sub
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

let redisSubscriber: Redis | null = null;

try {
  redisSubscriber = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 1) {
        return null; // Stop retrying after 1 attempt when running locally without Redis
      }
      return 2000;
    },
    lazyConnect: true,
    enableOfflineQueue: false
  });

  // Attach error handler to prevent unhandled EventEmitter error logs
  redisSubscriber.on('error', (err) => {
    // Suppress repeated connection logs in local development
  });

  redisSubscriber.connect().then(() => {
    console.log(`[Redis] Connected to Pub/Sub on ${REDIS_HOST}:${REDIS_PORT}`);
    redisSubscriber!.subscribe('transactions:stream', 'fraud:evaluations', (err, count) => {
      if (err) {
        console.error('[Redis] Failed to subscribe:', err);
      } else {
        console.log(`[Redis] Subscribed to ${count} channels.`);
      }
    });

    redisSubscriber!.on('message', (channel, message) => {
      try {
        const parsed = JSON.parse(message);
        if (channel === 'transactions:stream') {
          handleIncomingTransaction(parsed);
        }
      } catch (err) {
        console.error('[Redis] Failed to parse message:', err);
      }
    });
  }).catch((err) => {
    console.log(`[Redis] Local Redis not detected. Gateway running in Standalone Fallback mode.`);
    if (redisSubscriber) {
      redisSubscriber.disconnect();
      redisSubscriber = null;
    }
  });
} catch (e: any) {
  console.log(`[Redis] Standalone fallback mode active.`);
}

function handleIncomingTransaction(tx: TransactionEvent) {
  recentTransactions.unshift(tx);
  if (recentTransactions.length > 200) {
    recentTransactions.pop();
  }

  totalVolumeCents += tx.amount_cents;
  if (tx.status === 'APPROVED') approvedCount++;
  else if (tx.status === 'BLOCKED') blockedCount++;
  else if (tx.status === 'FLAGGED_FOR_REVIEW') flaggedCount++;

  // Broadcast to all connected React Web dashboards and mobile apps
  realtimeHub.broadcast('TRANSACTION_CREATED', tx);

  // Trigger merchant webhook if merchant URL exists
  webhookDispatcher.dispatch('http://merchant-endpoint.local/webhook', `payment.${tx.status.toLowerCase()}`, tx);
}

// REST Endpoints
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'gateway-node',
    active_websockets: realtimeHub.getClientCount(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/stats', (req: Request, res: Response) => {
  const total = approvedCount + blockedCount + flaggedCount;
  const stats: SystemStats = {
    total_transactions: total,
    total_volume_cents: totalVolumeCents,
    approved_count: approvedCount,
    blocked_count: blockedCount,
    flagged_count: flaggedCount,
    tps: Math.max(1, Math.round(total / 60)),
    average_risk_score: recentTransactions.length > 0 
      ? Math.round(recentTransactions.reduce((acc, t) => acc + (t.risk_score || 0), 0) / recentTransactions.length)
      : 0
  };
  res.json(stats);
});

app.get('/api/transactions/live', (req: Request, res: Response) => {
  res.json(recentTransactions.slice(0, 50));
});

// Broadcast endpoint so local simulator can feed directly without Redis if needed
app.post('/api/events/broadcast', (req: Request, res: Response) => {
  const tx: TransactionEvent = req.body;
  handleIncomingTransaction(tx);
  res.json({ success: true, broadcasted_to: realtimeHub.getClientCount() });
});

// Manual Compliance Triage Action (Approve / Block)
app.post('/api/alerts/:id/triage', (req: Request, res: Response) => {
  const { id } = req.params;
  const { decision, notes } = req.body; // decision: 'APPROVE' | 'BLOCK'

  const tx = recentTransactions.find(t => t.id === id);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found in active cache' });
  }

  const prevStatus = tx.status;
  if (decision === 'APPROVE') {
    tx.status = 'APPROVED';
    approvedCount++;
    if (prevStatus === 'FLAGGED_FOR_REVIEW') flaggedCount--;
  } else {
    tx.status = 'BLOCKED';
    blockedCount++;
    if (prevStatus === 'FLAGGED_FOR_REVIEW') flaggedCount--;
  }

  // Broadcast triage decision update
  realtimeHub.broadcast('TRANSACTION_STATUS_UPDATED', {
    transaction_id: id,
    new_status: tx.status,
    analyst_notes: notes || 'Manual compliance officer override',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, transaction: tx });
});

server.listen(PORT, () => {
  console.log(`[Gateway] Node.js Real-time Gateway listening on port ${PORT}`);
  console.log(`[Gateway] WebSocket endpoint available at ws://localhost:${PORT}/ws`);
});
