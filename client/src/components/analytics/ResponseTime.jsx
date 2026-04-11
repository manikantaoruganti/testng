import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Clock from 'lucide-react';

const ResponseTime = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-textSecondary text-center py-8">
        <Clock className="w-12 h-12 mx-auto mb-4" />
        <p>No response time data available.</p>
      </div>
    );
  }

  return (
    <div className="h-64">
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
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="incidentType" stroke="var(--textSecondary)" />
          <YAxis stroke="var(--textSecondary)" label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', fill: 'var(--textSecondary)' }} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.1)' }}
            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
            labelStyle={{ color: 'var(--primary)' }}
            itemStyle={{ color: 'var(--text)' }}
          />
          <Bar dataKey="avgResponseTime" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseTime;

