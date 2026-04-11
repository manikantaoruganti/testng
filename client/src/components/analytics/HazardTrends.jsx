import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TrendingUp from 'lucide-react';

const HazardTrends = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-textSecondary text-center py-8">
        <TrendingUp className="w-12 h-12 mx-auto mb-4" />
        <p>No hazard trend data available.</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--textSecondary)" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
          <YAxis stroke="var(--textSecondary)" label={{ value: 'Incidents', angle: -90, position: 'insideLeft', fill: 'var(--textSecondary)' }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
            labelStyle={{ color: 'var(--primary)' }}
            itemStyle={{ color: 'var(--text)' }}
          />
          <Area type="monotone" dataKey="fire" stackId="1" stroke="var(--error)" fill="var(--error)" fillOpacity={0.6} />
          <Area type="monotone" dataKey="panic" stackId="1" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.6} />
          <Area type="monotone" dataKey="system" stackId="1" stroke="var(--secondary)" fill="var(--secondary)" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HazardTrends;

