import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TrendingUp from 'lucide-react';

const COLORS = ['var(--success)', 'var(--error)', 'var(--warning)'];

const EvacuationEfficiency = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-textSecondary text-center py-8">
        <TrendingUp className="w-12 h-12 mx-auto mb-4" />
        <p>No evacuation efficiency data available.</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
            labelStyle={{ color: 'var(--primary)' }}
            itemStyle={{ color: 'var(--text)' }}
          />
          <Legend wrapperStyle={{ color: 'var(--textSecondary)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EvacuationEfficiency;

