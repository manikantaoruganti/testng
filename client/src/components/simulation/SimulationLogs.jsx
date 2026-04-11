import React from 'react';
import { List, Clock, AlertTriangle } from 'lucide-react';

const SimulationLogs = ({ logs }) => {
  return (
    <div className="card p-4 mt-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <List className="text-primary" /> Simulation Logs
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
        {logs.length === 0 ? (
          <p className="text-textSecondary text-center py-4">No simulation events logged yet.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="simulation-log-entry">
              <span className="text-textSecondary text-xs mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="text-text">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimulationLogs;

