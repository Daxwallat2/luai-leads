import React, { useState, useEffect } from 'react';
import type { Lead } from '../types';

interface EditLeadModalProps {
    lead: Lead;
    onClose: () => void;
    onSave: (lead: Lead) => void;
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({ lead, onClose, onSave }) => {
    const [formData, setFormData] = useState<Lead>({ ...lead });
    const [newNote, setNewNote] = useState('');

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
                notes: [...prev.notes, noteWithTimestamp]
            }));
            setNewNote('');
        }
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
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                    </div>

                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        {/* Contact Info */}
                        <div className="border-b border-slate-700 pb-4">
                            <h3 className="text-lg font-semibold text-brand-green mb-3">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                            </div>
                        </div>

                        {/* Address Info */}
                        <div className="border-b border-slate-700 pb-4">
                            <h3 className="text-lg font-semibold text-brand-green mb-3">Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Street</label>
                                    <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">State</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Zip Code</label>
                                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                            </div>
                        </div>

                        {/* Lead Info */}
                        <div className="border-b border-slate-700 pb-4">
                             <h3 className="text-lg font-semibold text-brand-green mb-3">Lead Details</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Source</label>
                                    <input type="text" name="source" value={formData.source} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green">
                                        <option value="Qualified">Qualified</option>
                                        <option value="Not Qualified">Not Qualified</option>
                                    </select>
                                </div>
                             </div>
                        </div>

                        {/* Notes */}
                        <div>
                             <h3 className="text-lg font-semibold text-brand-green mb-3">Notes</h3>
                             <div className="space-y-2 max-h-40 overflow-y-auto bg-slate-900/50 p-3 rounded-md border border-slate-700">
                                {formData.notes.length > 0 ? formData.notes.map((note, index) => (
                                    <p key={index} className="text-sm text-slate-300 border-b border-slate-700 pb-1">{note}</p>
                                )) : <p className="text-sm text-slate-500">No notes yet.</p>}
                             </div>
                             <div className="mt-3 flex gap-2">
                                <input 
                                    type="text"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add a new note..."
                                    className="flex-1 w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
                                />
                                <button type="button" onClick={handleAddNote} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-500 transition-colors">Add Note</button>
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