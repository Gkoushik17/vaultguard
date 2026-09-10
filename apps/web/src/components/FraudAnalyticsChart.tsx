import React from 'react';
import { BarChart3, AlertTriangle, Globe, Zap } from 'lucide-react';
import { Transaction } from '../types';

interface FraudAnalyticsChartProps {
  transactions: Transaction[];
}

export const FraudAnalyticsChart: React.FC<FraudAnalyticsChartProps> = ({ transactions }) => {
  // Compute risk score distribution
  const bins = {
    clean: 0,    // 0 - 35
    medium: 0,   // 36 - 74
    critical: 0  // 75 - 100
  };

  const reasonCounts: Record<string, number> = {
    VELOCITY: 0,
    AMOUNT: 0,
    MCC: 0,
    GEO: 0,
  };

  transactions.forEach((tx) => {
    const score = tx.risk_score || 0;
    if (score < 36) bins.clean++;
    else if (score < 75) bins.medium++;
    else bins.critical++;

    if (tx.risk_reasons) {
      tx.risk_reasons.forEach((r) => {
        if (r.code.includes('VELOCITY')) reasonCounts.VELOCITY++;
        if (r.code.includes('AMOUNT')) reasonCounts.AMOUNT++;
        if (r.code.includes('MCC')) reasonCounts.MCC++;
        if (r.code.includes('GEO')) reasonCounts.GEO++;
      });
    }
  });

  const total = Math.max(transactions.length, 1);
  const cleanPct = Math.round((bins.clean / total) * 100);
  const mediumPct = Math.round((bins.medium / total) * 100);
  const critPct = Math.round((bins.critical / total) * 100);

  return (
    <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            AI Risk Score Distribution & Signals
          </h2>
          <p className="text-xs text-slate-400">Scored across {transactions.length} active window transactions</p>
        </div>
        <span className="text-xs font-mono text-slate-400">Model: IsolationForest + Heuristic Ensembling</span>
      </div>

      {/* Distribution Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className="text-emerald-400">Clean (0-35): {cleanPct}%</span>
          <span className="text-amber-400">Elevated (36-74): {mediumPct}%</span>
          <span className="text-rose-400">Blocked (75-100): {critPct}%</span>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
          <div style={{ width: `${cleanPct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Clean: ${bins.clean}`}></div>
          <div style={{ width: `${mediumPct}%` }} className="bg-amber-500 transition-all duration-500" title={`Elevated: ${bins.medium}`}></div>
          <div style={{ width: `${critPct}%` }} className="bg-rose-500 transition-all duration-500" title={`Critical: ${bins.critical}`}></div>
        </div>
      </div>

      {/* Triggered AI Rule Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-md text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{reasonCounts.VELOCITY}</div>
            <div className="text-[11px] text-slate-400">Velocity Bursts</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-md text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{reasonCounts.AMOUNT}</div>
            <div className="text-[11px] text-slate-400">Amount Outliers</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-md text-purple-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{reasonCounts.MCC}</div>
            <div className="text-[11px] text-slate-400">High-Risk MCCs</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-md text-cyan-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{reasonCounts.GEO}</div>
            <div className="text-[11px] text-slate-400">Impossible Travel</div>
          </div>
        </div>
      </div>

    </div>
  );
};
