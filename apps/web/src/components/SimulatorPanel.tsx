import React, { useState } from 'react';
import { Play, Flame, RefreshCw, AlertOctagon, CheckCircle2, Globe2 } from 'lucide-react';

interface SimulatorPanelProps {
  onTriggerPayment: (payload: any) => Promise<void>;
}

export const SimulatorPanel: React.FC<SimulatorPanelProps> = ({ onTriggerPayment }) => {
  const [loading, setLoading] = useState(false);
  const [autoStreaming, setAutoStreaming] = useState(false);

  const triggerClean = async () => {
    setLoading(true);
    await onTriggerPayment({
      idempotency_key: 'idemp_' + Math.random().toString(36).substring(2, 10),
      source_account_id: 'a0000000-0000-0000-0000-000000000002', // Alice
      destination_account_id: 'a0000000-0000-0000-0000-000000000001',
      amount_cents: Math.floor(Math.random() * 4000) + 1500, // $15 - $55
      currency: 'USD',
      merchant_id: 'm0000000-0000-0000-0000-000000000002',
      merchant_category_code: '5411', // Groceries
      payment_method: 'APPLE_PAY',
      location_city: 'San Francisco',
      location_country: 'US'
    });
    setLoading(false);
  };

  const triggerHighValue = async () => {
    setLoading(true);
    await onTriggerPayment({
      idempotency_key: 'idemp_' + Math.random().toString(36).substring(2, 10),
      source_account_id: 'a0000000-0000-0000-0000-000000000002',
      destination_account_id: 'a0000000-0000-0000-0000-000000000001',
      amount_cents: 220000, // $2,200.00
      currency: 'USD',
      merchant_id: 'm0000000-0000-0000-0000-000000000001',
      merchant_category_code: '5732', // Electronics
      payment_method: 'VISA_CREDIT',
      location_city: 'New York',
      location_country: 'US'
    });
    setLoading(false);
  };

  const triggerVelocityBurst = async () => {
    setLoading(true);
    const suspectAcc = 'a0000000-0000-0000-0000-000000000004';
    for (let i = 0; i < 5; i++) {
      await onTriggerPayment({
        idempotency_key: 'idemp_burst_' + Math.random().toString(36).substring(2, 10),
        source_account_id: suspectAcc,
        destination_account_id: 'a0000000-0000-0000-0000-000000000001',
        amount_cents: 4500 + i * 500,
        currency: 'USD',
        merchant_id: 'm0000000-0000-0000-0000-000000000002',
        merchant_category_code: '5411',
        payment_method: 'STORED_CARD',
        location_city: 'Chicago',
        location_country: 'US'
      });
    }
    setLoading(false);
  };

  const triggerGamblingFraud = async () => {
    setLoading(true);
    await onTriggerPayment({
      idempotency_key: 'idemp_casino_' + Math.random().toString(36).substring(2, 10),
      source_account_id: 'a0000000-0000-0000-0000-000000000004',
      destination_account_id: 'a0000000-0000-0000-0000-000000000001',
      amount_cents: 850000, // $8,500.00
      currency: 'USD',
      merchant_id: 'm0000000-0000-0000-0000-000000000003',
      merchant_category_code: '7995', // Gambling
      payment_method: 'CRYPTO_BRIDGE',
      device_fingerprint: 'fp_spoofed_proxy',
      location_city: 'Curacao',
      location_country: 'CW'
    });
    setLoading(false);
  };

  // Continuous background stream toggle
  React.useEffect(() => {
    let interval: any = null;
    if (autoStreaming) {
      interval = setInterval(() => {
        const scenarios = [triggerClean, triggerClean, triggerClean, triggerHighValue];
        const randomFn = scenarios[Math.floor(Math.random() * scenarios.length)];
        randomFn();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [autoStreaming]);

  return (
    <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            FinTech Live Traffic & Threat Simulator
          </h2>
          <p className="text-xs text-slate-400">Inject real payloads into Golang & Python pipeline to test immediate detection</p>
        </div>

        <button
          onClick={() => setAutoStreaming(!autoStreaming)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            autoStreaming
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${autoStreaming ? 'animate-spin' : ''}`} />
          <span>{autoStreaming ? 'Stop Auto-Stream' : 'Start Auto-Traffic'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          disabled={loading}
          onClick={triggerClean}
          className="p-3 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-lg text-left transition disabled:opacity-50 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-400">Clean Payment</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition" />
          </div>
          <p className="text-[11px] text-slate-400">$35 Grocery (MCC 5411)</p>
        </button>

        <button
          disabled={loading}
          onClick={triggerHighValue}
          className="p-3 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-lg text-left transition disabled:opacity-50 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-amber-400">High-Value Outlier</span>
            <Play className="w-4 h-4 text-amber-500 group-hover:scale-110 transition" />
          </div>
          <p className="text-[11px] text-slate-400">$2,200 Tech purchase</p>
        </button>

        <button
          disabled={loading}
          onClick={triggerVelocityBurst}
          className="p-3 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-lg text-left transition disabled:opacity-50 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-rose-400">Velocity Burst Attack</span>
            <Flame className="w-4 h-4 text-rose-500 group-hover:scale-110 transition" />
          </div>
          <p className="text-[11px] text-slate-400">5 rapid payments in 2s</p>
        </button>

        <button
          disabled={loading}
          onClick={triggerGamblingFraud}
          className="p-3 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-lg text-left transition disabled:opacity-50 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-purple-400">Offshore Gambling</span>
            <AlertOctagon className="w-4 h-4 text-purple-500 group-hover:scale-110 transition" />
          </div>
          <p className="text-[11px] text-slate-400">$8,500 Offshore + Spoofed FP</p>
        </button>
      </div>

    </div>
  );
};
