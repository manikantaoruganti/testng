import React from 'react';
import useCrisisStore from '../../store/crisisStore';
import { Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CrowdDensity = () => {
  const { crowdDensity, loading, error } = useCrisisStore();

  if (loading) return <div className="text-center text-textSecondary">Loading crowd density...</div>;
  if (error) return <div className="text-error flex items-center gap-2"><AlertTriangle /> Error loading crowd density.</div>;

  const data = Object.entries(crowdDensity).map(([location, count]) => ({
    location,
    count,
  }));

  return (
    <div className="h-64">
      {data.length === 0 ? (
        <p className="text-textSecondary text-center py-4">No crowd data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={crowdDensity.border} />
            <XAxis dataKey="location" stroke={crowdDensity.textSecondary} tickFormatter={(value) => value.substring(0, 8)} />
            <YAxis stroke={crowdDensity.textSecondary} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
              labelStyle={{ color: 'var(--primary)' }}
              itemStyle={{ color: 'var(--text)' }}
            />
            <Bar dataKey="count" fill="url(#colorUv)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CrowdDensity;

