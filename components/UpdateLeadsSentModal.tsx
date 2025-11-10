import React, { useState, useEffect } from 'react';
import type { Buyer } from '../types';

interface UpdateLeadsSentModalProps {
    buyer: Buyer;
    onClose: () => void;
    onSave: (buyerId: string, newCount: number) => void;
}

const UpdateLeadsSentModal: React.FC<UpdateLeadsSentModalProps> = ({ buyer, onClose, onSave }) => {
    const [count, setCount] = useState(buyer.leadsSentThisMonth);

    useEffect(() => {
        setCount(buyer.leadsSentThisMonth);
    }, [buyer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.valueAsNumber;
        if (isNaN(value)) {
            setCount(0);
        } else {
            setCount(Math.max(0, Math.min(buyer.monthlyCap, value)));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(buyer.id, count);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white">Update Leads Sent</h2>
                        <p className="text-sm text-slate-400">for {buyer.name}</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="leadsSent" className="block text-sm font-medium text-slate-400 mb-1">
                                Leads Sent This Month
                            </label>
                            <div className="relative">
                                <input
                                    id="leadsSent"
                                    type="number"
                                    value={count}
                                    onChange={handleChange}
                                    min="0"
                                    max={buyer.monthlyCap}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                                    autoFocus
                                />
                                <span className="absolute inset-y-0 right-4 flex items-center text-slate-400 font-mono text-lg">
                                    / {buyer.monthlyCap.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-700 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-500 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-brand-green text-white font-bold py-2 px-5 rounded-lg hover:bg-emerald-500 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateLeadsSentModal;