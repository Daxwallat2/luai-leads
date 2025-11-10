import React, { useState, useMemo } from 'react';
import type { User } from '../../types';
import { EditIcon, UserGroupIcon } from '../Icons';

interface SettingsProps {
    onSimulateWebhook: () => void;
    users: User[];
    onOpenUserModal: (user: User | null) => void;
    onDeleteUser: (userId: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onSimulateWebhook, users, onOpenUserModal, onDeleteUser }) => {
    const [copied, setCopied] = useState(false);
    
    const webhookUrl = useMemo(() => {
        // Construct a dynamic webhook URL that will be intercepted by the service worker
        return `${window.location.origin}/api/v1/webhooks/in/u-AbCdEfG12345`;
    }, []);

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
                 {/* User Management */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                             <UserGroupIcon className="h-6 w-6 text-brand-green"/>
                            <h4 className="text-xl font-semibold text-white">User Management</h4>
                         </div>
                        <button onClick={() => onOpenUserModal(null)} className="bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-500 transition-colors text-sm">
                            + Add User
                        </button>
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
                                        <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">{user.role}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <button onClick={() => onOpenUserModal(user)} className="text-slate-400 hover:text-brand-green p-1">
                                                    <EditIcon className="h-4 w-4" />
                                                </button>
                                                 <button onClick={() => onDeleteUser(user.id)} className="text-slate-400 hover:text-red-500 p-1">
                                                    &times;
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Webhook */}
                 <div className="border-t border-slate-700 pt-8">
                    <h4 className="text-lg font-semibold text-white mb-4">Webhook Integration</h4>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm rounded-lg p-4 mb-6">
                        <strong className="font-semibold">Live Backend Active:</strong> This application uses a Service Worker to simulate a live backend. The URL below is a functional endpoint within this browser session. You can send real POST requests to it from tools like Postman or cURL.
                    </div>

                    <p className="text-slate-400 text-sm mb-4">
                       Send POST requests to the URL below to create new leads. Use the "Simulate" button to test payloads from within the app.
                    </p>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Your Webhook URL</label>
                        <div className="flex items-center">
                            <input 
                                type="text" 
                                readOnly 
                                value={webhookUrl} 
                                className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-300 font-mono focus:outline-none"
                            />
                            <button 
                                type="button" 
                                onClick={handleCopy} 
                                className="ml-2 bg-slate-600 text-white font-bold py-2 px-3 rounded-md hover:bg-slate-500 transition-colors text-sm w-24 flex-shrink-0"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm text-slate-400 mb-2">Send a POST request with a JSON body like this:</p>
                        <pre className="bg-slate-900 p-4 rounded-md text-xs text-slate-300 overflow-x-auto">
                            <code>
{`{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "(555) 555-5555",
  "source": "My Awesome Website",
  "status": "Qualified", // Optional: "Qualified" or "Not Qualified". Defaults to "Not Qualified".
  "notes": ["This is an example note."],
  // Use a single line for AI parsing...
  "address": "123 Awesome St, Austin, TX 78701"
  // ...OR provide structured fields:
  // "street": "123 Awesome St",
  // "city": "Austin",
  // "state": "Texas",
  // "zipCode": "78701"
}`}
                            </code>
                        </pre>
                    </div>
                    <button 
                        type="button"
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