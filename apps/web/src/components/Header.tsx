import React from 'react';
import { ShieldAlert, Server, Cpu, Database, Activity, Wifi } from 'lucide-react';

interface HeaderProps {
  wsConnected: boolean;
  tps: number;
}

export const Header: React.FC<HeaderProps> = ({ wsConnected, tps }) => {
  return (
    <header className="border-b border-slate-800 bg-[#0d1322] px-6 py-4 sticky top-0 z-30 shadow-lg backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">VAULT<span className="text-emerald-400">GUARD</span></h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                PROD v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Real-Time Payment Core & AI Fraud Defense Matrix</p>
          </div>
        </div>

        {/* Microservices Cluster Health Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">Go Core:</span>
            <span className="text-emerald-400 font-mono">8080 OK</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-slate-200">Python AI:</span>
            <span className="text-emerald-400 font-mono">8000 OK</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">Node Hub:</span>
            <span className="text-emerald-400 font-mono">5000 OK</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-200">Postgres:</span>
            <span className="text-emerald-400 font-mono">5432 OK</span>
          </div>

          {/* Real-time WebSocket Status */}
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-md border font-semibold ${
            wsConnected 
              ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300' 
              : 'bg-amber-950/60 border-amber-700/60 text-amber-300 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <Wifi className="w-3.5 h-3.5" />
            <span>{wsConnected ? `LIVE (${tps} TPS)` : 'POLLING FALLBACK'}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
