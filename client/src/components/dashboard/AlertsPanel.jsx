import React from 'react';
import useCrisisStore from '../../store/crisisStore';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../shared/Badge';

const AlertsPanel = () => {
  const { alerts, loading, error } = useCrisisStore();

  if (loading) return <div className="text-center text-textSecondary">Loading alerts...</div>;
  if (error) return <div className="text-error flex items-center gap-2"><AlertTriangle /> Error loading alerts.</div>;

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
      {alerts.length === 0 ? (
        <p className="text-textSecondary text-center py-4">No active alerts.</p>
      ) : (
        alerts.map(alert => (
          <div key={alert.id} className={`p-4 rounded-xl border ${alert.severity === 'critical' ? 'bg-error/10 border-error' : alert.severity === 'warning' ? 'bg-warning/10 border-warning' : 'bg-secondary/10 border-secondary'} animate-slide-in-up`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {alert.severity === 'critical' && <XCircle className="w-5 h-5 text-error" />}
                {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-warning" />}
                {alert.severity === 'info' && <Info className="w-5 h-5 text-secondary" />}
                <span className="font-semibold text-text">{alert.title}</span>
              </div>
              <Badge type={alert.severity}>{alert.severity.toUpperCase()}</Badge>
            </div>
            <p className="text-textSecondary text-sm mb-2">{alert.message}</p>
            <div className="flex justify-between items-center text-xs text-textSecondary">
              <span>Location: {alert.locationId}</span>
              <span>Time: {new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AlertsPanel;

