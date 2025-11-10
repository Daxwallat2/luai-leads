import React, { useState, useEffect } from 'react';
import type { Lead } from '../types';

interface EditLeadModalProps {
    lead: Lead;
    onClose: () => void;
    onSave: (lead: Lead) => void;
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({ lead, onClose, onSave }) => {
    const [formData, setFormData] = useState<Lead>({ ...lead });

    useEffect(() => {
        setFormData({ ...lead });
    }, [lead]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-3xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Edit Lead: {lead.name}</h2>
                    </div>
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        {/* Form fields */}
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                        <input type="text" name="street" value={formData.street} onChange={handleChange} placeholder="Street" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                        <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                        <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} placeholder="Zip Code" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                        <input type="text" name="source" value={formData.source} onChange={handleChange} placeholder="Source" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                         <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green">
                            <option value="Qualified">Qualified</option>
                            <option value="Not Qualified">Not Qualified</option>
                        </select>
                    </div>
                    <div className="p-4 border-t border-slate-700 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-500 transition-colors">Cancel</button>
                        <button type="submit" className="bg-brand-green text-white font-bold py-2 px-5 rounded-lg hover:bg-emerald-500 transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLeadModal;
