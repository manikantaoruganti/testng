import React from 'react';
import useSimulationStore from '../../store/simulationStore';
import { Play, FileText, AlertTriangle } from 'lucide-react';
import Button from '../shared/Button';

const ScenarioPanel = ({ scenarios, currentScenario }) => {
  const { selectScenario } = useSimulationStore();

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
      {scenarios.length === 0 ? (
        <p className="text-textSecondary text-center py-4">No simulation scenarios available.</p>
      ) : (
        scenarios.map(scenario => (
          <div
            key={scenario.id}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${currentScenario?.id === scenario.id ? 'bg-primary/20 border-primary shadow-glow' : 'bg-background border-border hover:bg-surface'}`}
            onClick={() => selectScenario(scenario.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="font-semibold text-text">{scenario.name}</span>
              </div>
              {currentScenario?.id === scenario.id && <Play className="w-5 h-5 text-primary" />}
            </div>
            <p className="text-textSecondary text-sm">{scenario.description}</p>
            <div className="flex justify-end mt-3">
              <Button
                onClick={(e) => { e.stopPropagation(); selectScenario(scenario.id); }}
                className="btn-secondary btn-sm"
              >
                Select
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ScenarioPanel;

