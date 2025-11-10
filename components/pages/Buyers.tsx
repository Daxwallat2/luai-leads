import React from 'react';
import type { Buyer } from '../../types';
import { EditIcon } from '../Icons';

interface BuyersPageProps {
    buyers: Buyer[];
    onOpenModal: (buyer: Buyer | null) => void;
    onViewDetails: (buyer: Buyer) => void;
    onUpdateLeadsSent: (buyer: Buyer) => void;
    selectedBuyerIds: Set<string>;
    onSelectionChange: (buyerId: string, isSelected: boolean) => void;
    onSelectAll: (isSelected: boolean) => void;
    onDeleteSelected: () => void;
}

const statusStyles: { [key in Buyer['status']]: string } = {
    Active: 'text-green-400 border-green-400/50 bg-green-500/10',
    Inactive: 'text-slate-400 border-slate-500/50 bg-slate-500/10'
};

const Buyers: React.FC<BuyersPageProps> = ({ 
    buyers, 
    onOpenModal, 
    onViewDetails,
    onUpdateLeadsSent,
    selectedBuyerIds,
    onSelectionChange,
    onSelectAll,
    onDeleteSelected
}) => {
    const areAllSelected = buyers.length > 0 && buyers.every(b => selectedBuyerIds.has(b.id!));

    const handleResetCaps = async () => {
        // This would be a bulk update in a real scenario
        alert("This would reset all buyer's monthly caps. Endpoint not implemented yet.");
    };

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                 <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold text-white">All Buyers</h3>
                    {selectedBuyerIds.size > 0 && (
                        <button 
                            onClick={onDeleteSelected}
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors text-sm"
                        >
                            Delete Selected ({selectedBuyerIds.size})
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleResetCaps} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-500 transition-colors text-sm">
                        Reset All Caps
                    </button>
                    <button onClick={() => onOpenModal(null)} className="bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-500 transition-colors text-sm">
                        + New Buyer
                    </button>
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
                            <th scope="col" className="px-6 py-3">Buyer Name</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                            <th scope="col" className="px-6 py-3">Monthly Progress</th>
                            <th scope="col" className="px-6 py-3">Lead Preference</th>
                            <th scope="col" className="px-6 py-3">Markets</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buyers.map((buyer) => (
                            <tr key={buyer.id} className={`border-b border-slate-700 hover:bg-slate-700/50 ${selectedBuyerIds.has(buyer.id!) ? 'bg-slate-700/50' : ''}`}>
                                <td className="p-4">
                                     <input 
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 rounded bg-slate-600 border-slate-500 text-brand-green focus:ring-brand-green"
                                        checked={selectedBuyerIds.has(buyer.id!)}
                                        onChange={(e) => onSelectionChange(buyer.id!, e.target.checked)}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                    <button onClick={() => onViewDetails(buyer)} className="hover:text-brand-green hover:underline text-left">
                                      {buyer.name}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[buyer.status]}`}>
                                        {buyer.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onUpdateLeadsSent(buyer)}
                                        className="flex items-center group cursor-pointer w-full text-left p-1 rounded-md -ml-1 hover:bg-slate-700"
                                        title="Update leads sent this month"
                                    >
                                        <span className="font-mono text-white mr-2">{buyer.leads_sent_this_month.toLocaleString()} / {buyer.monthly_cap.toLocaleString()}</span>
                                        <div className="w-24 bg-slate-600 rounded-full h-2 flex-shrink-0">
                                            <div className="bg-brand-green h-2 rounded-full" style={{ width: `${(buyer.leads_sent_this_month / buyer.monthly_cap) * 100}%` }}></div>
                                        </div>
                                        <EditIcon className="h-3 w-3 ml-2 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </td>
                                <td className="px-6 py-4">{buyer.lead_qualification_preference}</td>
                                <td className="px-6 py-4 relative group">
                                    {buyer.markets.length}
                                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-900 border border-slate-700 p-2 rounded-md text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        {buyer.markets.join(', ')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => onOpenModal(buyer)} className="text-slate-400 hover:text-brand-green p-1">
                                          <EditIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Buyers;
