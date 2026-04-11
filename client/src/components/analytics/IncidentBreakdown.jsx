import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PieChart from 'lucide-react';

const IncidentBreakdown = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-textSecondary text-center py-8">
        <PieChart className="w-12 h-12 mx-auto mb-4" />
        <p>No incident breakdown data available.</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis type="number" stroke="var(--textSecondary)" />
          <YAxis dataKey="type" type="category" stroke="var(--textSecondary)" />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
            labelStyle={{ color: 'var(--primary)' }}
            itemStyle={{ color: 'var(--text)' }}
          />
          <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncidentBreakdown;

