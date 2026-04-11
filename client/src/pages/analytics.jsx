import React, { useEffect } from 'react';
import useAnalyticsStore from '../store/analyticsStore'; // Assuming an analytics store
import RiskChart from '../components/analytics/RiskChart';
import ResponseTime from '../components/analytics/ResponseTime';
import EvacuationEfficiency from '../components/analytics/EvacuationEfficiency';
import HazardTrends from '../components/analytics/HazardTrends';
import IncidentBreakdown from '../components/analytics/IncidentBreakdown';
import Loader from '../components/shared/Loader';
import { BarChart, Clock, TrendingUp, PieChart, AlertTriangle } from 'lucide-react';

function Analytics() {
  const { analyticsData, loading, error, fetchAnalyticsData } = useAnalyticsStore(); // Placeholder store

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

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
        <h2 className="text-2xl font-bold">Error Loading Analytics</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-4xl font-bold text-text mb-8">Performance Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <BarChart className="text-primary" /> Overall Risk Assessment
          </h2>
          <RiskChart data={analyticsData?.riskScores || []} />
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="text-secondary" /> Average Response Time
          </h2>
          <ResponseTime data={analyticsData?.responseTimes || []} />
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-accent" /> Evacuation Efficiency
          </h2>
          <EvacuationEfficiency data={analyticsData?.evacuationEfficiency || []} />
        </div>

        <div className="card col-span-full lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <BarChart className="text-primary" /> Hazard Trends
          </h2>
          <HazardTrends data={analyticsData?.hazardTrends || []} />
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <PieChart className="text-secondary" /> Incident Breakdown
          </h2>
          <IncidentBreakdown data={analyticsData?.incidentBreakdown || []} />
        </div>
      </div>
    </div>
  );
}

export default Analytics;

