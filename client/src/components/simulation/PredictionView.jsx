import React from 'react';
import useCrisisStore from '../../store/crisisStore';
import BuildingMap from '../dashboard/BuildingMap'; // Reusing the BuildingMap for prediction visualization
import { AlertTriangle, TrendingUp } from 'lucide-react';

const PredictionView = ({ currentScenario, simulationData }) => {
  const { building, currentFloor } = useCrisisStore(); // Get building structure from crisis store

  if (!currentScenario) {
    return (
      <div className="text-textSecondary text-center py-8">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
        <p>Select a scenario to view its prediction.</p>
      </div>
    );
  }

  const currentFloorData = building?.floors.find(f => f.id === currentFloor);

  if (!currentFloorData) {
    return (
      <div className="text-textSecondary text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-warning" />
        <p>No floor selected or building data unavailable for prediction.</p>
      </div>
    );
  }

  // In a real implementation, simulationData would be processed to update
  // the state (people, hazards, routes) that BuildingMap consumes.
  // For now, BuildingMap will show the current crisis state.
  return (
    <div className="relative w-full h-full">
      <h3 className="text-xl font-semibold mb-4">Scenario: {currentScenario.name}</h3>
      <div className="h-[calc(100%-60px)]"> {/* Adjust height based on header */}
        <BuildingMap floorData={currentFloorData} />
      </div>
    </div>
  );
};

export default PredictionView;

