import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, Ban, MapPin, Smartphone, CreditCard, Clock, Key } from 'lucide-react';
import { Transaction } from '../types';

interface RiskDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onTriage: (id: string, decision: 'APPROVE' | 'BLOCK', notes?: string) => Promise<void>;
}

export const RiskDetailModal: React.FC<RiskDetailModalProps> = ({
  transaction,
  onClose,
  onTriage
}) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  if (!transaction) return null;

  const handleAction = async (decision: 'APPROVE' | 'BLOCK') => {
    setLoading(true);
    try {
      await onTriage(transaction.id, decision, notes);
      onClose();
    } catch (err) {
      console.error('Triage error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-rose-400 bg-rose-950/60 border-rose-800';
    if (score >= 36) return 'text-amber-400 bg-amber-950/60 border-amber-800';
    return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Transaction Risk Analysis</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {transaction.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Top Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] uppercase text-slate-400 font-semibold block">Amount</span>
              <span className="text-xl font-bold text-white font-mono">
                ${(transaction.amount_cents / 100).toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase text-slate-400 font-semibold block">Status</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block mt-1 font-mono bg-slate-800 text-slate-200 border border-slate-700">
                {transaction.status}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase text-slate-400 font-semibold block">AI Risk Index</span>
              <span className={`text-base font-bold px-2.5 py-0.5 rounded border inline-block mt-1 font-mono ${getScoreColor(transaction.risk_score)}`}>
                {transaction.risk_score} / 100
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase text-slate-400 font-semibold block">Method</span>
              <span className="text-xs text-slate-300 font-medium block mt-1">
                {transaction.payment_method}
              </span>
            </div>
          </div>

          {/* AI Triggered Factors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Triggered Risk Signals ({transaction.risk_reasons?.length || 0})
            </h4>
            {(!transaction.risk_reasons || transaction.risk_reasons.length === 0) ? (
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                No malicious behavioral indicators detected. Standard risk baseline.
              </div>
            ) : (
              <div className="space-y-2">
                {transaction.risk_reasons.map((factor, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-300">{factor.code}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          {factor.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{factor.description}</p>
                    </div>
                    <span className="text-xs font-mono text-rose-400 font-bold whitespace-nowrap">
                      +{factor.weight} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Network, Geo & Fingerprint Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Geographic Origin
              </span>
              <div className="text-slate-400 space-y-0.5">
                <p>City: <span className="text-slate-200 font-medium">{transaction.location_city || 'N/A'}</span></p>
                <p>Country: <span className="text-slate-200 font-medium">{transaction.location_country || 'N/A'}</span></p>
                <p>IP Address: <span className="text-slate-200 font-mono">{transaction.ip_address || '127.0.0.1'}</span></p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" /> Device & Audit Integrity
              </span>
              <div className="text-slate-400 space-y-0.5">
                <p>Fingerprint: <span className="text-slate-200 font-mono text-[11px]">{transaction.device_fingerprint || 'fp_native_mobile'}</span></p>
                <p>Idempotency: <span className="text-slate-200 font-mono text-[11px] truncate block">{transaction.idempotency_key}</span></p>
                <p>Timestamp: <span className="text-slate-200 font-mono text-[11px]">{new Date(transaction.created_at).toLocaleTimeString()}</span></p>
              </div>
            </div>
          </div>

          {/* Analyst Action Box */}
          <div className="border-t border-slate-800 pt-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Compliance Officer Notes / Override Rationale:
            </label>
            <input 
              type="text" 
              placeholder="e.g. Cardholder confirmed identity via SMS 2FA"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-4 font-sans"
            />

            <div className="flex items-center justify-end space-x-3">
              <button 
                disabled={loading}
                onClick={() => handleAction('APPROVE')}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Override & Approve</span>
              </button>

              <button 
                disabled={loading}
                onClick={() => handleAction('BLOCK')}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                <span>Confirm Fraud & Block</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
