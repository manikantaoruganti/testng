import React from 'react';
import { Flame, XCircle, Users, ArrowRightCircle } from 'lucide-react';

const HazardLegend = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg animate-fade-in">
      <h3 className="text-lg font-semibold text-text mb-3">Map Legend</h3>
      <ul className="space-y-2 text-textSecondary text-sm">
        <li className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-error animate-pulse-glow"></div>
          <span>Hazard Zone (e.g., Fire)</span>
        </li>
        <li className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-secondary"></div>
          <span>Person Location</span>
        </li>
        <li className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary"></div>
          <span>Exit / Stairwell</span>
        </li>
        <li className="flex items-center gap-2">
          <div className="w-4 h-4 bg-success rounded-sm"></div>
          <span>Safe Evacuation Path</span>
        </li>
        <li className="flex items-center gap-2">
          <div className="w-4 h-4 bg-error rounded-sm"></div>
          <span>Blocked Path</span>
        </li>
      </ul>
    </div>
  );
};

export default HazardLegend;

