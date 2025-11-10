import React from 'react';
import type { Lead } from '../types';

interface RecentLeadsTableProps {
  leads: Lead[];
}

const statusColors: { [key in Lead['status']]: string } = {
  Qualified: 'bg-green-500/20 text-green-400',
  'Not Qualified': 'bg-red-500/20 text-red-400',
};

const RecentLeadsTable: React.FC<RecentLeadsTableProps> = ({ leads }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Leads</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Source</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{lead.name}</td>
                <td className="px-6 py-4">{lead.source}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(lead.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentLeadsTable;