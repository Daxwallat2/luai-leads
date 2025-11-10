import React, { useState, useMemo } from 'react';
import type { DeliveryLog, Lead, Buyer } from '../../types';
import LeadDetailsModal from '../LeadDetailsModal';

interface LeadDeliveryProps {
    deliveryLog: DeliveryLog[];
    leads: Lead[];
    buyers: Buyer[];
}

const statusStyles: { [key in DeliveryLog['status']]: string } = {
    Success: 'text-green-400',
    Failed: 'text-red-400',
};

const LeadDelivery: React.FC<LeadDeliveryProps> = ({ deliveryLog, leads, buyers }) => {
    const [filters, setFilters] = useState({
        timestamp: '',
        lead: '',
        buyer: '',
        status: 'All', // 'All', 'Success', 'Failed'
        response: '',
    });
    const [viewingLeadDetails, setViewingLeadDetails] = useState<Lead | null>(null);
    
    const leadMap = useMemo(() => new Map(leads.map(l => [l.id, l])), [leads]);
    const buyerMap = useMemo(() => new Map(buyers.map(b => [b.id, b.name])), [buyers]);

    const filteredLog = useMemo(() => {
        return deliveryLog
            .map(log => {
                const lead = leadMap.get(log.leadId);
                const leadName = lead?.name || 'Unknown Lead';
                const buyerName = log.buyerId === 'N/A' ? 'N/A' : (buyerMap.get(log.buyerId) || 'Unknown Buyer');
                return { ...log, leadName, buyerName };
            })
            .filter(log => {
                const lowerTimestamp = filters.timestamp.toLowerCase();
                const lowerLead = filters.lead.toLowerCase();
                const lowerBuyer = filters.buyer.toLowerCase();
                const lowerResponse = filters.response.toLowerCase();

                const timestampMatch = new Date(log.timestamp).toLocaleString().toLowerCase().includes(lowerTimestamp);
                const leadMatch = log.leadName.toLowerCase().includes(lowerLead);
                const buyerMatch = log.buyerName.toLowerCase().includes(lowerBuyer);
                const statusMatch = filters.status === 'All' || log.status === filters.status;
                const responseMatch = log.response.toLowerCase().includes(lowerResponse);

                return timestampMatch && leadMatch && buyerMatch && statusMatch && responseMatch;
            })
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [deliveryLog, filters, leadMap, buyerMap]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleViewLeadDetails = (leadId: string) => {
        const lead = leadMap.get(leadId);
        if (lead) {
            setViewingLeadDetails(lead);
        }
    };

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Lead Delivery Log</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">Lead</th>
                            <th scope="col" className="px-6 py-3">Buyer</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                            <th scope="col" className="px-6 py-3">Response</th>
                        </tr>
                         <tr className="bg-slate-700/80">
                            <th className="px-3 py-2">
                                <input type="text" name="timestamp" placeholder="Search..." value={filters.timestamp} onChange={handleFilterChange} className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green" />
                            </th>
                             <th className="px-3 py-2">
                                <input type="text" name="lead" placeholder="Search..." value={filters.lead} onChange={handleFilterChange} className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green" />
                            </th>
                             <th className="px-3 py-2">
                                <input type="text" name="buyer" placeholder="Search..." value={filters.buyer} onChange={handleFilterChange} className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green" />
                            </th>
                            <th className="px-3 py-2 text-center">
                                <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-green">
                                    <option value="All">All</option>
                                    <option value="Success">Success</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            </th>
                            <th className="px-3 py-2">
                                <input type="text" name="response" placeholder="Search..." value={filters.response} onChange={handleFilterChange} className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLog.length > 0 ? filteredLog.map((log) => {
                            const lead = leadMap.get(log.leadId);
                            return (
                                <tr key={log.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        {lead ? (
                                            <button onClick={() => handleViewLeadDetails(log.leadId)} className="hover:text-brand-green hover:underline text-left">
                                                {log.leadName}
                                            </button>
                                        ) : (
                                            <span>{log.leadName}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{log.buyerName}</td>
                                    <td className={`px-6 py-4 text-center font-semibold ${statusStyles[log.status]}`}>
                                        {log.status}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{log.response}</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-slate-500">No delivery logs match the current filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {viewingLeadDetails && (
                <LeadDetailsModal lead={viewingLeadDetails} onClose={() => setViewingLeadDetails(null)} />
            )}
        </div>
    );
};

export default LeadDelivery;