import React from 'react';
import { BarChart, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../shared/Badge';

const ScenarioStats = ({ stats }) => {
  if (!stats) {
    return (
      <div className="text-textSecondary text-center py-4">
        <BarChart className="w-8 h-8 mx-auto mb-2" />
        <p>No statistics available for this scenario.</p>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-3">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <BarChart className="text-primary" /> Scenario Statistics
      </h3>
      <div className="flex items-center justify-between">
        <span className="text-textSecondary flex items-center gap-2"><Clock className="w-4 h-4" /> Duration:</span>
        <Badge type="info">{stats.duration || 'N/A'}s</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-textSecondary flex items-center gap-2"><Users className="w-4 h-4" /> People Evacuated:</span>
        <Badge type="success">{stats.peopleEvacuated || 0}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-textSecondary flex items-center gap-2"><XCircle className="w-4 h-4" /> Casualties:</span>
        <Badge type="error">{stats.casualties || 0}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-textSecondary flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Success Rate:</span>
        <Badge type="primary">{stats.successRate || 0}%</Badge>
      </div>
    </div>
  );
};

export default ScenarioStats;

