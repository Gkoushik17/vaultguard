import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ShieldCheck, ShieldAlert, Ban, Clock, ChevronRight } from 'lucide-react';
import { Transaction } from '../types';

interface LiveTransactionFeedProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
}

export const LiveTransactionFeed: React.FC<LiveTransactionFeedProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'FLAGGED_FOR_REVIEW' | 'BLOCKED'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((tx) => {
    if (filter !== 'ALL' && tx.status !== filter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.location_city?.toLowerCase().includes(q) ||
        tx.payment_method.toLowerCase().includes(q) ||
        (tx.amount_cents / 100).toString().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <ShieldCheck className="w-3 h-3" /> Approved
          </span>
        );
      case 'FLAGGED_FOR_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
            <ShieldAlert className="w-3 h-3" /> In Review
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
            <Ban className="w-3 h-3" /> Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-rose-400 font-bold';
    if (score >= 36) return 'text-amber-400 font-bold';
    return 'text-emerald-400 font-semibold';
  };

  return (
    <div className="bg-[#101726] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      
      {/* Control Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/40">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            Live Ingested Transactions
          </h2>
          <p className="text-xs text-slate-400">Streamed via Node.js WebSockets & Go Core</p>
        </div>

        {/* Filter Buttons & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Search by ID, city, amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            {(['ALL', 'APPROVED', 'FLAGGED_FOR_REVIEW', 'BLOCKED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  filter === tab
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'FLAGGED_FOR_REVIEW' ? 'Review' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Method / Origin</th>
              <th className="py-3 px-4">AI Risk Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                  No transactions found matching the criteria.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr 
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="hover:bg-slate-800/50 cursor-pointer transition group"
                >
                  <td className="py-3 px-4 font-mono font-medium text-slate-200">
                    {tx.id.length > 18 ? `${tx.id.slice(0, 8)}...${tx.id.slice(-6)}` : tx.id}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(tx.created_at).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    ${(tx.amount_cents / 100).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-300 font-medium">{tx.payment_method}</div>
                    <div className="text-[10px] text-slate-500">{tx.location_city || 'New York'}, {tx.location_country || 'US'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono ${getRiskColor(tx.risk_score)}`}>
                      {tx.risk_score} / 100
                    </span>
                    {tx.risk_reasons && tx.risk_reasons.length > 0 && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {tx.risk_reasons[0].code}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition inline-block" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
