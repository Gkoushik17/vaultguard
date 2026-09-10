import React from 'react';
import { DollarSign, ShieldCheck, ShieldX, Gauge } from 'lucide-react';
import { SystemStats } from '../types';

interface MetricsBarProps {
  stats: SystemStats;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ stats }) => {
  const formatDollars = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(cents / 100);
  };

  const total = stats.total_transactions || 1;
  const approvalRate = ((stats.approved_count / total) * 100).toFixed(1);
  const fraudRate = (((stats.blocked_count + stats.flagged_count) / total) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Metric 1: Total Volume */}
      <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Ingested Volume</span>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {formatDollars(stats.total_volume_cents)}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{stats.total_transactions}</span> total transactions processed
          </p>
        </div>
      </div>

      {/* Metric 2: Live Processing Rate */}
      <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Go Processing TPS</span>
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
            <Gauge className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {stats.tps} <span className="text-sm font-normal text-slate-400">req/s</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sub-millisecond Go engine throughput
          </p>
        </div>
      </div>

      {/* Metric 3: Clean Approval Rate */}
      <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clean Approval Rate</span>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {approvalRate}%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {stats.approved_count} auto-cleared payments
          </p>
        </div>
      </div>

      {/* Metric 4: Fraud Intercept Rate */}
      <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Intercept Rate</span>
          <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
            <ShieldX className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-rose-400 tracking-tight font-mono">
            {fraudRate}%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {stats.blocked_count} blocked, {stats.flagged_count} flagged for review
          </p>
        </div>
      </div>

    </div>
  );
};
