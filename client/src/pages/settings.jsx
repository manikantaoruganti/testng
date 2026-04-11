import React, { useState, useEffect } from 'react';
import useConfigStore from '../store/configStore'; // Assuming a config store
import Button from '../components/shared/Button';
import Loader from '../components/shared/Loader';
import { Settings as SettingsIcon, Save, AlertTriangle } from 'lucide-react';

function Settings() {
  const { config, loading, error, fetchConfig, updateConfig } = useConfigStore(); // Placeholder store
  const [localConfig, setLocalConfig] = useState({});

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateConfig(localConfig);
    alert('Settings updated successfully!');
  };

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
        <h2 className="text-2xl font-bold">Error Loading Settings</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-4xl font-bold text-text mb-8 flex items-center gap-4">
        <SettingsIcon className="text-primary w-10 h-10" /> System Settings
      </h1>

      <div className="card p-8 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="simulationSpeed" className="block text-textSecondary text-sm font-medium mb-2">
              Default Simulation Speed
            </label>
            <input
              type="number"
              id="simulationSpeed"
              name="simulationSpeed"
              value={localConfig.simulationSpeed || 1}
              onChange={handleChange}
              className="input-field"
              min="0.1"
              step="0.1"
            />
          </div>

          <div>
            <label htmlFor="alertThreshold" className="block text-textSecondary text-sm font-medium mb-2">
              Critical Alert Threshold (%)
            </label>
            <input
              type="number"
              id="alertThreshold"
              name="alertThreshold"
              value={localConfig.alertThreshold || 80}
              onChange={handleChange}
              className="input-field"
              min="0"
              max="100"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableRealtimeUpdates"
              name="enableRealtimeUpdates"
              checked={localConfig.enableRealtimeUpdates || false}
              onChange={handleChange}
              className="h-5 w-5 text-primary rounded border-border focus:ring-primary"
            />
            <label htmlFor="enableRealtimeUpdates" className="ml-3 text-textSecondary text-sm font-medium">
              Enable Real-time UI Updates
            </label>
          </div>

          <div className="pt-4">
            <Button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-5 h-5" /> Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;

