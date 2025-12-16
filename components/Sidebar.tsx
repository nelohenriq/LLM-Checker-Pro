import React from 'react';
import { View, DashboardStats } from '../types';
import { LayoutDashboard, Database, Terminal, FileText, Settings, Activity, Loader2 } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  stats: DashboardStats;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, stats }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Overview', icon: LayoutDashboard },
    { id: View.MODELS, label: 'Model Database', icon: Database },
    { id: View.LOGS, label: 'System Logs', icon: Terminal },
    { id: View.API, label: 'API Reference', icon: FileText },
    // { id: View.SETTINGS, label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 border-b border-gray-800">
        <div className="bg-cyan-500/10 p-2 rounded-lg">
          <Activity className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="font-bold text-gray-100 tracking-tight">LLM Checker</h1>
          <p className="text-xs text-gray-500 font-mono">v1.1.0-pro</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gray-800 text-cyan-400 border-l-2 border-cyan-400'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded p-3">
          <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider">Status</p>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${stats.status === 'POLLING' ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`}></div>
            <span className={`text-xs font-mono font-bold ${stats.status === 'POLLING' ? 'text-amber-400' : 'text-green-400'}`}>
              {stats.status === 'POLLING' ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
          {stats.status === 'POLLING' && stats.currentActivity && (
             <div className="text-[10px] text-gray-400 font-mono leading-tight border-t border-gray-700 pt-2 animate-pulse">
                <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                {stats.currentActivity}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;