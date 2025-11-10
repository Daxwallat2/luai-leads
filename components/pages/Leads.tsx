import React, { useState } from 'react';
import type { Lead } from '../../types';

interface LeadsPageProps {
    leads: Lead[];
    onEditLead: (lead: Lead) => void;
    selectedLeadIds: Set<string>;
    onSelectionChange: (leadId: string, isSelected: boolean) => void;
    onSelectAll: (isSelected: boolean) => void;
    onDeleteSelected: () => void;
}

const deliveryStatusColors: { [key in Lead['delivery_status']]: string } = {
  Pending: 'bg-slate-500/20 text-slate-400',
  Queued: 'bg-cyan-500/20 text-cyan-400',
  Delivered: 'bg-green-500/20 text-green-400',
  Failed: 'bg-red-500/20 text-red-400',
};

const Leads: React.FC<LeadsPageProps> = ({ 
    leads, 
    onEditLead, 
    selectedLeadIds,
    onSelectionChange,
    onSelectAll,
    onDeleteSelected
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLeads = leads.filter(lead => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
            lead.name.toLowerCase().includes(lowerSearchTerm) ||
            lead.email.toLowerCase().includes(lowerSearchTerm) ||
            lead.phone.replace(/[()\s-]/g, '').includes(lowerSearchTerm) ||
            lead.street.toLowerCase().includes(lowerSearchTerm) ||
            lead.city.toLowerCase().includes(lowerSearchTerm) ||
            lead.zip_code.includes(lowerSearchTerm)
        );
    }).sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

    const areAllSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.has(l.id!));

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold text-white">All Leads</h3>
                    {selectedLeadIds.size > 0 && (
                        <button 
                            onClick={onDeleteSelected}
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors text-sm"
                        >
                            Delete Selected ({selectedLeadIds.size})
                        </button>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-green"
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                        <tr>
                            <th scope="col" className="p-4">
                               <input 
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 rounded bg-slate-600 border-slate-500 text-brand-green focus:ring-brand-green"
                                    checked={areAllSelected}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                            </th>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Address</th>
                            <th scope="col" className="px-6 py-3">Source</th>
                            <th scope="col" className="px-6 py-3">Delivery</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.map((lead) => (
                            <tr
                              key={lead.id}
                              className={`border-b border-slate-700 hover:bg-slate-700/50 ${selectedLeadIds.has(lead.id!) ? 'bg-slate-700/50' : ''}`}
                            >
                                <td className="p-4">
                                     <input 
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 rounded bg-slate-600 border-slate-500 text-brand-green focus:ring-brand-green"
                                        checked={selectedLeadIds.has(lead.id!)}
                                        onChange={(e) => onSelectionChange(lead.id!, e.target.checked)}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-white whitespace-nowrap cursor-pointer" onClick={() => onEditLead(lead)}>{lead.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => onEditLead(lead)}>{`${lead.street}, ${lead.city}, ${lead.state} ${lead.zip_code}`}</td>
                                <td className="px-6 py-4 cursor-pointer" onClick={() => onEditLead(lead)}>{lead.source}</td>
                                <td className="px-6 py-4 cursor-pointer" onClick={() => onEditLead(lead)}>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${deliveryStatusColors[lead.delivery_status]}`}>
                                        {lead.delivery_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 cursor-pointer" onClick={() => onEditLead(lead)}>{new Date(lead.created_at!).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leads;
