import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';

interface UserModalProps {
    user: UserProfile | null;
    onClose: () => void;
    onSave: (user: UserProfile) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        full_name: '',
        email: '',
        role: 'User',
    });

    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name,
                email: user.email,
                role: user.role,
            });
        }
        // "Add User" is disabled for now, as it's handled by Supabase Auth page
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userData: UserProfile = {
            id: user?.id || '',
            full_name: formData.full_name || '',
            email: user?.email || '', // Email is not editable here
            role: formData.role || 'User',
        };
        onSave(userData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit User Profile' : 'Add New User'}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                            <input type="email" name="email" value={formData.email} disabled className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-400 cursor-not-allowed"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green">
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-700 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-500 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-brand-green text-white font-bold py-2 px-5 rounded-lg hover:bg-emerald-500 transition-colors">
                            Save User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
