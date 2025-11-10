import React, { useState, useEffect } from 'react';
import type { Lead } from '../types';

interface EditLeadModalProps {
    lead: Lead;
    onClose: () => void;
    onSave: (lead: Lead) => void;
    onAdd: (lead: Omit<Lead, 'id'>) => void;
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({ lead, onClose, onSave, onAdd }) => {
    const [formData, setFormData] = useState<Partial<Lead>>({ ...lead });
    const [newNote, setNewNote] = useState('');
    const isNewLead = !lead.id;

    useEffect(() => {
        setFormData({ ...lead });
    }, [lead]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNote = () => {
        if (newNote.trim()) {
            const noteWithTimestamp = `${new Date().toLocaleString()}: ${newNote.trim()}`;
            setFormData(prev => ({
                ...prev,
                notes: [...(prev.notes || []), noteWithTimestamp]
            }));
            setNewNote('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isNewLead) {
            const newLeadData: Omit<Lead, 'id'> = {
                name: formData.name || 'New Lead',
                email: formData.email || '',
                phone: formData.phone || '',
                source: formData.source || 'Manual',
                status: formData.status || 'Qualified',
                deliveryStatus: 'Pending',
                createdAt: new Date().toISOString(),
                street: formData.street || '',
                city: formData.city || '',
                state: formData.state || '',
                zipCode: formData.zipCode || '',
                notes: formData.notes || [],
            };
            onAdd(newLeadData);
        } else {
            onSave(formData as Lead);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-3xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">{isNewLead ? 'Add New Lead' : `Edit Lead: ${lead.name}`}</h2>
                    </div>
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        <div>
                            <h3 className="text-lg font-semibold text-brand-green mb-3">Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Street</label>
                                    <input type="text" name="street" value={formData.street || ''} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">City</label>
                                    <input type="text" name="city" value={formData.city || ''} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">State</label>
                                    <input type="text" name="state" value={formData.state || ''} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Zip Code</label>
                                    <input type="text" name="zipCode" value={formData.zipCode || ''} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-700 flex justify-end gap-4">
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

export default EditLeadModal;