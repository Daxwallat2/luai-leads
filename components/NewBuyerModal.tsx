import React, { useState, useEffect } from 'react';
import type { Buyer } from '../types';
import MarketSelectorModal from './MarketSelectorModal';

interface BuyerModalProps {
    buyer: Buyer | null;
    onClose: () => void;
    onSave: (buyer: Buyer) => void;
}

const BuyerModal: React.FC<BuyerModalProps> = ({ buyer, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Buyer, 'id'>>({
        name: '',
        status: 'Active',
        webhookUrl: '',
        monthlyCap: 1000,
        leadsSentThisMonth: 0,
        cycleStartDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        markets: [],
        leadQualificationPreference: 'Both',
    });
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);

    useEffect(() => {
        if (buyer) {
            setFormData({
                name: buyer.name,
                status: buyer.status,
                webhookUrl: buyer.webhookUrl,
                monthlyCap: buyer.monthlyCap,
                leadsSentThisMonth: buyer.leadsSentThisMonth,
                cycleStartDate: buyer.cycleStartDate,
                markets: buyer.markets,
                leadQualificationPreference: buyer.leadQualificationPreference || 'Both',
            });
        } else {
             setFormData({
                name: '',
                status: 'Active',
                webhookUrl: '',
                monthlyCap: 1000,
                leadsSentThisMonth: 0,
                cycleStartDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
                markets: [],
                leadQualificationPreference: 'Both',
            });
        }
    }, [buyer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'monthlyCap' ? parseInt(value, 10) || 0 : value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const buyerData: Buyer = {
            ...formData,
            id: buyer?.id || '', // ID is handled by parent
        };
        onSave(buyerData);
    };
    
    const handleSaveMarkets = (selectedMarkets: string[]) => {
        setFormData(prev => ({...prev, markets: selectedMarkets}));
        setIsMarketModalOpen(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
                <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSave}>
                        <div className="p-6 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white">{buyer ? 'Edit Buyer' : 'Create New Buyer'}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-1">Buyer Name</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="leadQualificationPreference" className="block text-sm font-medium text-slate-400 mb-1">Lead Preference</label>
                                <select id="leadQualificationPreference" name="leadQualificationPreference" value={formData.leadQualificationPreference} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green">
                                    <option value="Both">Qualified & Not Qualified</option>
                                    <option value="Qualified">Qualified Only</option>
                                    <option value="Not Qualified">Not Qualified Only</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="webhookUrl" className="block text-sm font-medium text-slate-400 mb-1">Webhook URL</label>
                                <input type="url" id="webhookUrl" name="webhookUrl" value={formData.webhookUrl} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                <p className="text-xs text-slate-500 mt-1">
                                    Note: The destination server must be configured with CORS to accept requests from this web application.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label htmlFor="monthlyCap" className="block text-sm font-medium text-slate-400 mb-1">Monthly Lead Cap</label>
                                    <input type="number" id="monthlyCap" name="monthlyCap" value={formData.monthlyCap} onChange={handleChange} min="0" required className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                                <div>
                                    <label htmlFor="cycleStartDate" className="block text-sm font-medium text-slate-400 mb-1">Cycle Start Date</label>
                                    <input type="date" id="cycleStartDate" name="cycleStartDate" value={formData.cycleStartDate} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Markets ({formData.markets.length})</label>
                                <button type="button" onClick={() => setIsMarketModalOpen(true)} className="w-full text-left bg-slate-700 border border-slate-600 rounded-md p-2 text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-green">
                                    {formData.markets.length > 0 ? `Selected ${formData.markets.length} markets` : 'Select Markets'}
                                </button>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-500 transition-colors">
                                Cancel
                            </button>
                             <button type="submit" className="bg-brand-green text-white font-bold py-2 px-5 rounded-lg hover:bg-emerald-500 transition-colors">
                                Save Buyer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {isMarketModalOpen && (
                <MarketSelectorModal 
                    initialSelectedMarkets={formData.markets}
                    onClose={() => setIsMarketModalOpen(false)}
                    onSave={handleSaveMarkets}
                />
            )}
        </>
    );
};

export default BuyerModal;