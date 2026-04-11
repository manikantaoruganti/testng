import React from 'react';
import { Thermometer, AlertTriangle } from 'lucide-react';
import Badge from '../shared/Badge';

const HeatStats = ({ data }) => {
  if (!data) {
    return (
      <div className="text-textSecondary text-center py-4">
        <Thermometer className="w-8 h-8 mx-auto mb-2" />
        <p>No heat statistics available.</p>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-3">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Thermometer className="text-primary" /> Heat Statistics
      </h3>
      <div className="flex items-center justify-between">
        <span className="text-textSecondary flex items-center gap-2">Max Temperature:</span>
        <Badge type="error">{data.maxTemp || 'N/A'}°C</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-textSecondary flex items-center gap-2">Avg Temperature:</span>
        <Badge type="warning">{data.avgTemp || 'N/A'}°C</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-textSecondary flex items-center gap-2">Affected Zones:</span>
        <Badge type="info">{data.affectedZones || 0}</Badge>
      </div>
    </div>
  );
};

export default HeatStats;

