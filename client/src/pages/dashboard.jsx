import React, { useEffect } from 'react';
import useCrisisStore from '../store/crisisStore';
import useSocket from '../hooks/useSocket';
import BuildingMap from '../components/dashboard/BuildingMap';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import LiveStatusBar from '../components/dashboard/LiveStatusBar';
import CrowdDensity from '../components/dashboard/CrowdDensity';
import HazardLegend from '../components/dashboard/HazardLegend';
import FloorSelector from '../components/dashboard/FloorSelector';
import Loader from '../components/shared/Loader';
import { AlertTriangle, Bell, Users, MapPin } from 'lucide-react';

function Dashboard() {
  const { building, currentFloor, loading, error, fetchBuildingData, setCurrentFloor } = useCrisisStore();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    fetchBuildingData();
  }, [fetchBuildingData]);

  useEffect(() => {
    if (socket) {
      socket.on('crisis_update', (data) => {
        console.log('Real-time crisis update:', data);
        // Here you would update the store with real-time data
        // For now, just logging
      });
      socket.on('simulation_update', (data) => {
        console.log('Real-time simulation update:', data);
        // Update simulation-specific data
      });
    }
    return () => {
      if (socket) {
        socket.off('crisis_update');
        socket.off('simulation_update');
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
        <h2 className="text-2xl font-bold">Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  const currentFloorData = building?.floors.find(f => f.id === currentFloor);

  return (
    <div className="dashboard-grid animate-fade-in">
      <header className="col-span-full flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-text">Real-time Operations Dashboard</h1>
        <LiveStatusBar isConnected={isConnected} />
      </header>

      <div className="map-container card relative overflow-hidden">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="text-primary" /> Building Overview - {currentFloorData?.name || 'Select Floor'}
        </h2>
        {building && (
          <FloorSelector
            floors={building.floors}
            currentFloor={currentFloor}
            onSelectFloor={setCurrentFloor}
          />
        )}
        {currentFloorData ? (
          <BuildingMap floorData={currentFloorData} />
        ) : (
          <div className="flex justify-center items-center h-full text-textSecondary">
            <p>Please select a floor to view the map.</p>
          </div>
        )}
        <HazardLegend />
      </div>

      <div className="alerts-panel-container flex flex-col gap-6">
        <div className="card flex-1">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="text-accent" /> Active Alerts
          </h2>
          <AlertsPanel />
        </div>
        <div className="card flex-1">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Users className="text-secondary" /> Crowd Density
          </h2>
          <CrowdDensity />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

