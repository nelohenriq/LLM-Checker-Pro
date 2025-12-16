import React, { useEffect, useRef } from 'react';
import { SystemLog } from '../types';
import { Terminal as TerminalIcon, Loader2 } from 'lucide-react';

interface TerminalLogsProps {
  logs: SystemLog[];
  isPolling: boolean;
}

const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, isPolling }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'text-blue-400';
      case 'WARN': return 'text-amber-400';
      case 'ERROR': return 'text-red-500';
      case 'SUCCESS': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">System Logs</h2>
            <p className="text-gray-400 text-sm">Live stream from the collector daemon (src/checker.ts).</p>
        </div>
        {isPolling && (
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs font-medium">POLLING ACTIVE</span>
            </div>
        )}
      </header>

      <div className="flex-1 bg-[#0d1117] border border-gray-800 rounded-xl p-4 overflow-hidden flex flex-col font-mono text-sm relative shadow-2xl">
         <div className="absolute top-0 left-0 right-0 h-8 bg-[#161b22] border-b border-gray-800 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
            <div className="ml-2 text-xs text-gray-500">bash - tail -f /var/log/llm-checker.log</div>
         </div>
         
         <div className="flex-1 overflow-y-auto mt-8 space-y-1 p-2">
            {logs.length === 0 && (
                <div className="text-gray-600 italic">Initializing logging subsystem...</div>
            )}
            {logs.map((log) => (
                <div key={log.id} className="flex gap-3 hover:bg-white/5 p-0.5 rounded">
                    <span className="text-gray-600 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={`font-bold shrink-0 w-16 ${getLevelColor(log.level)}`}>{log.level}</span>
                    <span className="text-purple-400 shrink-0 w-20">[{log.module}]</span>
                    <span className="text-gray-300 break-all">{log.message}</span>
                </div>
            ))}
            <div ref={bottomRef} />
            {isPolling && (
                 <div className="flex gap-2 items-center text-gray-500 mt-2 pl-1 animate-pulse">
                    <span className="text-green-500">➜</span>
                    <span>Processing stream...</span>
                 </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default TerminalLogs;