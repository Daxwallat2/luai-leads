import React, { useState } from 'react';
import type { User } from '../../types';

interface LoginProps {
    users: User[];
    onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find(u => u.id === selectedUserId);
        if (user) {
            onLogin(user);
        } else {
            alert("Please select a user to log in.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white tracking-wider">
                        LUAI<span className="text-brand-green">Leads</span>
                    </h1>
                    <p className="mt-2 text-slate-400">
                       Select a user profile to log in
                    </p>
                </div>
                {users.length > 0 ? (
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                             <label className="block text-sm font-medium text-slate-400 mb-1">Select User</label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
                            >
                                <option value="" disabled>-- Choose a user --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={!selectedUserId}
                                className="w-full bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-500 transition-colors duration-300 disabled:opacity-50"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-center text-slate-400">No users found. Database might be initializing.</p>
                )}
            </div>
        </div>
    );
};

export default Login;
