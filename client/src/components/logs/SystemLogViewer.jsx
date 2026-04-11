import React from 'react';
import { Cpu, AlertTriangle } from 'lucide-react';

const SystemLogViewer = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-textSecondary text-center py-8">
        <Cpu className="w-12 h-12 mx-auto mb-4" />
        <p>No system logs available.</p>
      </div>
    );
  }

  return (
    <div className="bg-background p-4 rounded-xl border border-border font-mono text-sm text-textSecondary max-h-96 overflow-y-auto custom-scrollbar">
      {logs.map((log, index) => (
        <p key={index} className={`py-1 ${log.level === 'error' ? 'text-error' : log.level === 'warn' ? 'text-warning' : ''}`}>
          <span className="text-primary">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
          <span className="ml-2 uppercase font-bold">{log.level}:</span>
          <span className="ml-2">{log.message}</span>
        </p>
      ))}
    </div>
  );
};

export default SystemLogViewer;

