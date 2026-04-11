import React from 'react';
import useCrisisStore from '../../store/crisisStore';
import { ArrowRightCircle, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import Badge from '../shared/Badge';

const ExitRoutes = () => {
  const { evacuationRoutes, loading, error } = useCrisisStore();

  if (loading) return <div className="text-center text-textSecondary">Loading exit routes...</div>;
  if (error) return <div className="text-error flex items-center gap-2"><AlertTriangle /> Error loading exit routes.</div>;

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ArrowRightCircle className="text-primary" /> Evacuation Routes
      </h3>
      <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
        {evacuationRoutes.length === 0 ? (
          <p className="text-textSecondary">No active evacuation routes.</p>
        ) : (
          evacuationRoutes.map(route => (
            <div key={route.id} className="bg-background p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text font-medium">Route from {route.startNodeId} to {route.endNodeId}</span>
                {route.status === 'active' && <Badge type="success">Active</Badge>}
                {route.status === 'blocked' && <Badge type="error">Blocked</Badge>}
              </div>
              <p className="text-textSecondary text-sm flex items-center gap-1">
                <ArrowRightCircle className="w-4 h-4" /> Path: {route.path.join(' → ')}
              </p>
              <p className="text-textSecondary text-sm flex items-center gap-1 mt-1">
                {route.isSafe ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-error" />}
                Status: {route.isSafe ? 'Safe' : 'Compromised'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExitRoutes;

