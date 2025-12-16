import React, { useState, useEffect, useCallback } from 'react';
import { View, LLMModel, SystemLog, DashboardStats } from './types';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import ModelList from './components/ModelList';
import TerminalLogs from './components/TerminalLogs';
import ApiDocs from './components/ApiDocs';
import { discoverModels } from './services/huggingface';

const App: React.FC = () => {
  const [currentView, setView] = useState<View>(View.DASHBOARD);
  const [models, setModels] = useState<LLMModel[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalModels: 0,
    lastCheck: new Date().toISOString(),
    status: 'IDLE',
    dbSize: '0.0 MB',
    apiRequests: 0,
    currentActivity: 'System Idle'
  });

  // Helper to add logs
  const addLog = useCallback((level: SystemLog['level'], module: SystemLog['module'], message: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      module,
      message
    }]);
  }, []);

  // Simulator: This mimics the `src/checker.ts` polling loop
  const runCheckerSimulation = useCallback(async () => {
    if (isPolling) return;
    
    setIsPolling(true);
    setStats(s => ({ ...s, status: 'POLLING', currentActivity: 'Connecting to Hugging Face...' }));
    addLog('INFO', 'CHECKER', 'Starting scheduled poll of Hugging Face API...');
    
    try {
      // 1. Simulate Network delay
      await new Promise(r => setTimeout(r, 800));
      addLog('INFO', 'API', 'GET https://huggingface.co/api/models?sort=createdAt - 200 OK');
      
      // 2. Fetch Real Data
      setStats(s => ({ ...s, currentActivity: 'Parsing model metadata...' }));
      addLog('INFO', 'CHECKER', 'Processing response stream...');
      
      const discoveredRaw = await discoverModels();
      
      if (discoveredRaw.length === 0) {
        addLog('WARN', 'CHECKER', 'No new models found or API rate limited.');
      } else {
        addLog('INFO', 'CHECKER', `Discovered ${discoveredRaw.length} new candidates.`);
      }
      
      const discovered: LLMModel[] = discoveredRaw.map(m => ({
        ...m,
        id: `${m.provider}/${m.name}`,
        lastUpdated: new Date().toISOString()
      }));

      // Simulate Real-time "Processing" of each model to mimic the WebSocket broadcast
      for (const model of discovered) {
          setStats(s => ({ ...s, currentActivity: `Validating: ${model.name}` }));
          // Simulate some processing time
          await new Promise(r => setTimeout(r, 300)); 
          
          if (model.downloads > 10000) {
              addLog('INFO', 'CHECKER', `Indexing popular model: ${model.name} (${model.downloads} downloads)`);
          }
      }

      // 3. Update DB
      setStats(s => ({ ...s, currentActivity: 'Updating Database...' }));
      
      setModels(prev => {
          // Combine and filter unique by ID
          const combined = [...discovered, ...prev];
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
          // Sort by Release Date (Newest first)
          return unique.sort((a,b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
      });

      const newDbSize = ((JSON.stringify(discovered).length * 5) / 1024).toFixed(2) + ' KB';
      
      addLog('SUCCESS', 'DB', `Sync complete. Database updated.`);

      setStats(prev => ({
        ...prev,
        totalModels: prev.totalModels + discovered.length,
        lastCheck: new Date().toISOString(),
        status: 'IDLE',
        dbSize: newDbSize,
        apiRequests: prev.apiRequests + 1,
        currentActivity: 'System Idle'
      }));

    } catch (err) {
      console.error(err);
      addLog('ERROR', 'CHECKER', 'Failed to fetch models: Connection Failed');
      setStats(s => ({ ...s, status: 'ERROR', currentActivity: 'Error: Connection Failed' }));
    } finally {
      setIsPolling(false);
    }
  }, [addLog, isPolling]);

  // Initial Poll on mount
  useEffect(() => {
    addLog('INFO', 'SYSTEM', 'llm-checker daemon started v1.1.0-pro');
    addLog('INFO', 'DB', 'Connected to local JSON store');
    runCheckerSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <DashboardOverview stats={stats} recentModels={models} />;
      case View.MODELS:
        return <ModelList models={models} />;
      case View.LOGS:
        return <TerminalLogs logs={logs} isPolling={isPolling} />;
      case View.API:
        return <ApiDocs />;
      default:
        return <DashboardOverview stats={stats} recentModels={models} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500/30">
      <Sidebar currentView={currentView} setView={setView} stats={stats} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
          {renderContent()}
        </div>
      </main>

      {/* Floating Action Button to Trigger Check Manually */}
      <button 
        onClick={runCheckerSimulation}
        disabled={isPolling}
        className={`fixed bottom-8 right-8 p-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 z-50 flex items-center gap-2 font-bold ${
            isPolling ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-cyan-500/20'
        }`}
      >
        <div className={`w-2 h-2 bg-white rounded-full ${isPolling ? 'animate-ping' : ''}`} />
        {isPolling ? 'POLLING...' : 'RUN CHECK'}
      </button>
    </div>
  );
};

export default App;