import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AlertTriangle from 'lucide-react';

const RiskChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-textSecondary text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p>No risk data available.</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="timestamp" stroke="var(--textSecondary)" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
          <YAxis stroke="var(--textSecondary)" />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
            labelStyle={{ color: 'var(--primary)' }}
            itemStyle={{ color: 'var(--text)' }}
          />
          <Line type="monotone" dataKey="riskScore" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskChart;

