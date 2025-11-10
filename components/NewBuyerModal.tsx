import React, { useState, useEffect } from 'react';
import type { Buyer } from '../types';
import MarketSelectorModal from './MarketSelectorModal';

interface BuyerModalProps {
    buyer: Buyer | null;
    onClose: () => void;
    onSave: (buyer: Buyer) => void;
}

const BuyerModal: React.FC<BuyerModalProps> = ({ buyer, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Buyer, 'id' | 'user_id'>>({
        name: '',
        status: 'Active',
        webhook_url: '',
        monthly_cap: 1000,
        leads_sent_this_month: 0,
        cycle_start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        markets: [],
        lead_qualification_preference: 'Both',
    });
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);

    useEffect(() => {
        if (buyer) {
            setFormData({
                name: buyer.name,
                status: buyer.status,
                webhook_url: buyer.webhook_url,
                monthly_cap: buyer.monthly_cap,
                leads_sent_this_month: buyer.leads_sent_this_month,
                cycle_start_date: buyer.cycle_start_date,
                markets: buyer.markets,
                lead_qualification_preference: buyer.lead_qualification_preference || 'Both',
            });
        }
    }, [buyer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'monthly_cap' ? parseInt(value, 10) || 0 : value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const buyerData: Buyer = {
            ...formData,
            id: buyer?.id,
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
                            {/* Form fields */}
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Buyer Name" required className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                             <select id="lead_qualification_preference" name="lead_qualification_preference" value={formData.lead_qualification_preference} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green">
                                <option value="Both">Qualified & Not Qualified</option>
                                <option value="Qualified">Qualified Only</option>
                                <option value="Not Qualified">Not Qualified Only</option>
                            </select>
                            <input type="url" id="webhook_url" name="webhook_url" value={formData.webhook_url} onChange={handleChange} placeholder="Webhook URL" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                            <input type="number" id="monthly_cap" name="monthly_cap" value={formData.monthly_cap} onChange={handleChange} min="0" required placeholder="Monthly Lead Cap" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                             <input type="date" id="cycle_start_date" name="cycle_start_date" value={formData.cycle_start_date} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                             <button type="button" onClick={() => setIsMarketModalOpen(true)} className="w-full text-left bg-slate-700 border border-slate-600 rounded-md p-2 text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-green">
                                {formData.markets.length > 0 ? `Selected ${formData.markets.length} markets` : 'Select Markets'}
                            </button>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-500 transition-colors">Cancel</button>
                             <button type="submit" className="bg-brand-green text-white font-bold py-2 px-5 rounded-lg hover:bg-emerald-500 transition-colors">Save Buyer</button>
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
