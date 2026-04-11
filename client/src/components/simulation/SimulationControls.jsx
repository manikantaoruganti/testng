import React from 'react';
import { Play, Pause, RotateCcw, FastForward, AlertTriangle } from 'lucide-react';
import Button from '../shared/Button';

const SimulationControls = ({ simulationState, simulationSpeed, onStart, onPause, onResume, onReset, onSpeedChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-center">
        {simulationState === 'idle' && (
          <Button onClick={onStart} className="btn-primary flex items-center gap-2">
            <Play className="w-5 h-5" /> Start
          </Button>
        )}
        {simulationState === 'running' && (
          <Button onClick={onPause} className="btn-secondary flex items-center gap-2">
            <Pause className="w-5 h-5" /> Pause
          </Button>
        )}
        {simulationState === 'paused' && (
          <Button onClick={onResume} className="btn-primary flex items-center gap-2">
            <Play className="w-5 h-5" /> Resume
          </Button>
        )}
        <Button onClick={onReset} className="btn-secondary flex items-center gap-2">
          <RotateCcw className="w-5 h-5" /> Reset
        </Button>
      </div>

      <div className="flex items-center gap-4 justify-center">
        <label htmlFor="simulationSpeed" className="text-textSecondary font-medium">Speed:</label>
        <select
          id="simulationSpeed"
          value={simulationSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="input-field w-32"
        >
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="2">2x</option>
          <option value="5">5x</option>
          <option value="10">10x</option>
        </select>
      </div>

      {simulationState === 'error' && (
        <div className="text-error flex items-center gap-2 justify-center">
          <AlertTriangle /> Simulation Error
        </div>
      )}
    </div>
  );
};

export default SimulationControls;

