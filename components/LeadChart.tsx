import React from 'react';
import type { DailyLeads } from '../types';

interface LeadChartProps {
  data: DailyLeads[];
}

const LeadChart: React.FC<LeadChartProps> = ({ data }) => {
  // Check if Recharts is available on the window object before using it.
  if (!window.Recharts) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-96 flex items-center justify-center">
        <p className="text-slate-400">Loading chart library...</p>
      </div>
    );
  }

  // Recharts is loaded from a CDN, so we access it from the window object here.
  const { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } = window.Recharts;

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-96">
        <h3 className="text-lg font-semibold text-white mb-4">Leads Over Time</h3>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155'
                    }}
                    labelStyle={{ color: '#cbd5e1' }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} name="New Leads" />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default LeadChart;