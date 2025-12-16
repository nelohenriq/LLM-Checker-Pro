import React from 'react';
import { DashboardStats, LLMModel } from '../types';
import { Server, Download, Clock, Database, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardOverviewProps {
  stats: DashboardStats;
  recentModels: LLMModel[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, recentModels }) => {
  const chartData = recentModels.slice(0, 5).map(m => ({
    name: m.name.length > 15 ? m.name.substring(0, 15) + '...' : m.name,
    downloads: m.downloads
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-white mb-1">System Overview</h2>
        <p className="text-gray-400 text-sm">Real-time metrics from the checker daemon.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Models" 
          value={stats.totalModels.toString()} 
          icon={Database} 
          color="text-purple-400"
          bg="bg-purple-500/10"
        />
        <StatCard 
          title="DB Size" 
          value={stats.dbSize} 
          icon={Server} 
          color="text-cyan-400"
          bg="bg-cyan-500/10"
        />
        <StatCard 
          title="API Requests" 
          value={stats.apiRequests.toLocaleString()} 
          icon={Activity} 
          color="text-green-400"
          bg="bg-green-500/10"
        />
        <StatCard 
          title="Last Sync" 
          value={new Date(stats.lastCheck).toLocaleTimeString()} 
          icon={Clock} 
          color="text-amber-400"
          bg="bg-amber-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
             <Download className="w-5 h-5 text-gray-500" />
             Top Models by Downloads
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                    dataKey="name" 
                    stroke="#4b5563" 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis 
                    stroke="#4b5563" 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                    cursor={{fill: '#374151', opacity: 0.4}}
                />
                <Bar dataKey="downloads" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Mini List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Latest Discoveries</h3>
          <div className="space-y-4">
            {recentModels.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-10">Waiting for polling cycle...</div>
            ) : (
                recentModels.slice(0, 5).map((model) => (
                <div key={model.id} className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-cyan-900 group-hover:text-cyan-400 transition-colors">
                    HF
                    </div>
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-300 truncate group-hover:text-cyan-400 transition-colors">
                        {model.provider}/{model.name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{model.parameters} • {model.likes} likes</p>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl hover:border-gray-700 transition-colors">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-100">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

export default DashboardOverview;