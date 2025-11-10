import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const Auth: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white tracking-wider">
                        LUAI<span className="text-brand-green">Leads</span>
                    </h1>
                    <p className="mt-2 text-slate-400">{isSignUp ? 'Create a new account' : 'Sign in to your account'}</p>
                </div>
                <form className="space-y-6" onSubmit={handleAuth}>
                    {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm">{error}</div>}
                    {message && <div className="bg-green-500/20 text-green-300 p-3 rounded-lg text-sm">{message}</div>}
                    
                    {isSignUp && (
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"/>
                    </div>

                    <div>
                        <button type="submit" disabled={loading} className="w-full bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50">
                            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </div>
                </form>
                 <div className="text-center">
                    <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-sm text-slate-400 hover:text-brand-green">
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
