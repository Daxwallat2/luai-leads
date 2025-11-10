import React, { useState, useMemo } from 'react';
import type { UserProfile } from '../../types';
import { EditIcon, UserGroupIcon } from '../Icons';

interface SettingsProps {
    onSimulateWebhook: () => void;
    users: UserProfile[];
    onOpenUserModal: (user: UserProfile | null) => void;
}

const Settings: React.FC<SettingsProps> = ({ onSimulateWebhook, users, onOpenUserModal }) => {
    const [copied, setCopied] = useState(false);
    
    const webhookUrl = useMemo(() => `${window.location.origin}/api/webhook`, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(webhookUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    return (
        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-6">Settings</h3>
            <div className="space-y-10">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <UserGroupIcon className="h-6 w-6 text-brand-green"/>
                        <h4 className="text-xl font-semibold text-white">User Management</h4>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Role</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                        <td className="px-6 py-4 font-medium text-white">{user.full_name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">{user.role}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => onOpenUserModal(user)} className="text-slate-400 hover:text-brand-green p-1">
                                                <EditIcon className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                 <div className="border-t border-slate-700 pt-8">
                    <h4 className="text-lg font-semibold text-white mb-4">Webhook Integration</h4>
                    <p className="text-slate-400 text-sm mb-4">
                       Send POST requests with a valid JSON body to the URL below to create new leads.
                    </p>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Your Webhook URL</label>
                        <div className="flex items-center">
                            <input type="text" readOnly value={webhookUrl} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-300 font-mono focus:outline-none"/>
                            <button onClick={handleCopy} className="ml-2 bg-slate-600 text-white font-bold py-2 px-3 rounded-md hover:bg-slate-500 transition-colors text-sm w-24 flex-shrink-0">
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    <button 
                        onClick={onSimulateWebhook}
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors text-sm"
                    >
                        Simulate Inbound Lead
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
