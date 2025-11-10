import React, { useState, useMemo } from 'react';
import type { Buyer } from '../types';

interface LeadsNeededByStateProps {
    buyers: Buyer[];
}

const LeadsNeededByState: React.FC<LeadsNeededByStateProps> = ({ buyers }) => {
    const [filter, setFilter] = useState<'All' | 'Qualified' | 'Not Qualified'>('All');

    const neededByState = useMemo(() => {
        const stateNeeds: { [key: string]: number } = {};

        const eligibleBuyers = buyers.filter(buyer => {
            if (buyer.status !== 'Active') return false;
            if (filter === 'All') return true;
            return buyer.lead_qualification_preference === filter || buyer.lead_qualification_preference === 'Both';
        });

        for (const buyer of eligibleBuyers) {
            const remainingCap = buyer.monthly_cap - buyer.leads_sent_this_month;
            if (remainingCap > 0) {
                for (const state of buyer.markets) {
                    stateNeeds[state] = (stateNeeds[state] || 0) + remainingCap;
                }
            }
        }
        
        return Object.entries(stateNeeds)
            .map(([state, needed]) => ({ state, needed }))
            .filter(item => item.needed > 0)
            .sort((a, b) => b.needed - a.needed);
    }, [buyers, filter]);

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-96 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Leads Needed By State</h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => setFilter('All')} className={`text-xs px-3 py-1 rounded-full ${filter === 'All' ? 'bg-brand-green text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>All</button>
                    <button onClick={() => setFilter('Qualified')} className={`text-xs px-3 py-1 rounded-full ${filter === 'Qualified' ? 'bg-brand-green text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Qualified</button>
                    <button onClick={() => setFilter('Not Qualified')} className={`text-xs px-3 py-1 rounded-full ${filter === 'Not Qualified' ? 'bg-brand-green text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Not Qualified</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {neededByState.length > 0 ? (
                    <table className="w-full text-sm text-left text-slate-400">
                         <thead className="text-xs text-slate-400 uppercase bg-slate-700/50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-2">State</th>
                                <th scope="col" className="px-6 py-2 text-right">Leads Needed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {neededByState.map(({ state, needed }) => (
                                <tr key={state} className="border-b border-slate-700">
                                    <td className="px-6 py-3 font-medium text-white whitespace-nowrap">{state}</td>
                                    <td className="px-6 py-3 text-right font-mono text-white">{needed.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500">No open capacity for the current filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadsNeededByState;
