import React, { useState } from 'react';

interface LoginPageProps {
    onLogin: (email: string, pass: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('admin@luaileads.dev');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(email, password);
        if (!success) {
            setError('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white tracking-wider">
                        LUAI<span className="text-brand-green">Leads</span>
                    </h1>
                    <p className="mt-2 text-slate-400">Welcome back! Please sign in to your account.</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                         <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-1">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-400 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-500 transition-colors duration-300"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
