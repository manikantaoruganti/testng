import React, { useEffect, useState } from 'react';
import EventLogTable from '../components/logs/EventLogTable';
import DecisionLog from '../components/logs/DecisionLog';
import SystemLogViewer from '../components/logs/SystemLogViewer';
import useLogStore from '../store/logStore'; // Assuming a log store
import Loader from '../components/shared/Loader';
import { List, ScrollText, Cpu, AlertTriangle } from 'lucide-react';

function Logs() {
  const { eventLogs, decisionLogs, systemLogs, loading, error, fetchLogs } = useLogStore(); // Placeholder store
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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
        <h2 className="text-2xl font-bold">Error Loading Logs</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-4xl font-bold text-text mb-8">System Logs & Events</h1>

      <div className="flex border-b border-border mb-6">
        <button
          className={`px-6 py-3 text-lg font-medium ${activeTab === 'events' ? 'text-primary border-b-2 border-primary' : 'text-textSecondary hover:text-text'}`}
          onClick={() => setActiveTab('events')}
        >
          <List className="inline-block mr-2" /> Event Logs
        </button>
        <button
          className={`px-6 py-3 text-lg font-medium ${activeTab === 'decisions' ? 'text-primary border-b-2 border-primary' : 'text-textSecondary hover:text-text'}`}
          onClick={() => setActiveTab('decisions')}
        >
          <ScrollText className="inline-block mr-2" /> Decision Logs
        </button>
        <button
          className={`px-6 py-3 text-lg font-medium ${activeTab === 'system' ? 'text-primary border-b-2 border-primary' : 'text-textSecondary hover:text-text'}`}
          onClick={() => setActiveTab('system')}
        >
          <Cpu className="inline-block mr-2" /> System Logs
        </button>
      </div>

      <div className="card p-6">
        {activeTab === 'events' && <EventLogTable logs={eventLogs} />}
        {activeTab === 'decisions' && <DecisionLog logs={decisionLogs} />}
        {activeTab === 'system' && <SystemLogViewer logs={systemLogs} />}
      </div>
    </div>
  );
}

export default Logs;

