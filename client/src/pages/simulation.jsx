import React, { useState, useEffect } from 'react';
import useSimulationStore from '../store/simulationStore';
import useSocket from '../hooks/useSocket';
import ScenarioPanel from '../components/simulation/ScenarioPanel';
import SimulationControls from '../components/simulation/SimulationControls';
import PredictionView from '../components/simulation/PredictionView';
import SimulationLogs from '../components/simulation/SimulationLogs';
import EventTrigger from '../components/simulation/EventTrigger';
import Loader from '../components/shared/Loader';
import { Play, FastForward, Pause, AlertTriangle, Clock, Zap } from 'lucide-react';

function Simulation() {
  const {
    currentScenario,
    simulationState,
    simulationSpeed,
    loading,
    error,
    scenarios,
    fetchScenarios,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    setSimulationSpeed,
    triggerEvent,
    resetSimulation,
  } = useSimulationStore();
  const { socket, isConnected } = useSocket();
  const [simulationTime, setSimulationTime] = useState(0); // In seconds

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  useEffect(() => {
    let interval;
    if (simulationState === 'running') {
      interval = setInterval(() => {
        setSimulationTime(prev => prev + 1); // Increment every second
      }, 1000 / simulationSpeed); // Adjust interval based on speed
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [simulationState, simulationSpeed]);

  useEffect(() => {
    if (socket) {
      socket.on('simulation_tick', (data) => {
        console.log('Simulation tick:', data);
        // Update simulation state based on server ticks
        // For now, just logging
      });
      socket.on('simulation_event_triggered', (data) => {
        console.log('Simulation event triggered:', data);
        // Add event to simulation logs
      });
    }
    return () => {
      if (socket) {
        socket.off('simulation_tick');
        socket.off('simulation_event_triggered');
      }
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-error text-center p-8 card">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Error Loading Simulation Data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="simulation-grid animate-fade-in">
      <header className="col-span-full flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-text">Crisis Simulation Engine</h1>
        <div className="flex items-center gap-4 text-textSecondary">
          <Clock className="w-5 h-5" />
          <span>Simulation Time: {new Date(simulationTime * 1000).toISOString().substr(11, 8)}</span>
          <Zap className={`w-5 h-5 ${isConnected ? 'text-success' : 'text-error'}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </header>

      <div className="scenario-panel-container flex flex-col gap-6">
        <div className="card flex-1">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Play className="text-primary" /> Scenarios
          </h2>
          <ScenarioPanel scenarios={scenarios} currentScenario={currentScenario} />
        </div>
        <div className="card flex-1">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FastForward className="text-secondary" /> Controls
          </h2>
          <SimulationControls
            simulationState={simulationState}
            simulationSpeed={simulationSpeed}
            onStart={startSimulation}
            onPause={pauseSimulation}
            onResume={resumeSimulation}
            onReset={resetSimulation}
            onSpeedChange={setSimulationSpeed}
          />
        </div>
        <div className="card flex-1">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="text-accent" /> Trigger Events
          </h2>
          <EventTrigger onTrigger={triggerEvent} />
        </div>
      </div>

      <div className="simulation-view-container card relative overflow-hidden">
        <h2 className="text-2xl font-semibold mb-4">Prediction & Visualization</h2>
        <PredictionView currentScenario={currentScenario} simulationData={[]} /> {/* Pass actual simulation data */}
        <SimulationLogs logs={[]} /> {/* Pass actual simulation logs */}
      </div>
    </div>
  );
}

export default Simulation;

