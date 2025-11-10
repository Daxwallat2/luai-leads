import React, { useState, useMemo } from 'react';
import { generateAnalyticsSummary } from '../../services/geminiService';
import type { DailyLeads, LeadsBySource } from '../../types';

const mockDailyLeads: DailyLeads[] = [
    { date: 'Mon', count: 65 }, { date: 'Tue', count: 59 },
    { date: 'Wed', count: 80 }, { date: 'Thu', count: 81 },
    { date: 'Fri', count: 56 }, { date: 'Sat', count: 55 },
    { date: 'Sun', count: 40 },
];

const mockLeadsBySource: LeadsBySource[] = [
    { source: 'Organic Search', value: 400 },
    { source: 'Google Ads', value: 300 },
    { source: 'Facebook Ads', value: 200 },
    { source: 'Referral', value: 278 },
];

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

const Analytics: React.FC = () => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setError('');
        setSummary('');
        try {
            const result = await generateAnalyticsSummary(mockDailyLeads, mockLeadsBySource);
            setSummary(result);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const formattedSummary = useMemo(() => {
        if (!summary) return null;
        return summary
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
            .replace(/\n/g, '<br />');
    }, [summary]);

    // Defer access to Recharts until render time to avoid race conditions.
    const Recharts = window.Recharts;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-96">
                    <h3 className="text-lg font-semibold text-white mb-4">Leads by Source</h3>
                    {Recharts ? (
                        <Recharts.ResponsiveContainer width="100%" height="100%">
                            <Recharts.PieChart>
                                <Recharts.Pie data={mockLeadsBySource} dataKey="value" nameKey="source" cx="50%" cy="50%" outerRadius={120} fill="#8884d8">
                                    {mockLeadsBySource.map((entry, index) => (
                                        <Recharts.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Recharts.Pie>
                                <Recharts.Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                                <Recharts.Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '20px' }}/>
                            </Recharts.PieChart>
                        </Recharts.ResponsiveContainer>
                    ) : (
                         <div className="flex items-center justify-center h-full w-full">
                           <p className="text-slate-400">Loading chart library...</p>
                        </div>
                    )}
                </div>
                 <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-96">
                    <h3 className="text-lg font-semibold text-white mb-4">Weekly Lead Volume</h3>
                    {Recharts ? (
                        <Recharts.ResponsiveContainer width="100%" height="100%">
                             <Recharts.BarChart data={mockDailyLeads} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <Recharts.XAxis dataKey="date" stroke="#94a3b8" />
                                <Recharts.YAxis stroke="#94a3b8" />
                                <Recharts.Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} cursor={{fill: 'rgba(16, 185, 129, 0.1)'}}/>
                                <Recharts.Bar dataKey="count" fill="#10b981" name="New Leads" />
                            </Recharts.BarChart>
                        </Recharts.ResponsiveContainer>
                    ) : (
                         <div className="flex items-center justify-center h-full w-full">
                           <p className="text-slate-400">Loading chart library...</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">AI-Powered Analytics Summary</h3>
                    <button
                        onClick={handleGenerateSummary}
                        disabled={isLoading}
                        className="bg-brand-green text-white font-bold py-2 px-5 rounded-lg hover:bg-emerald-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            'Generate Summary'
                        )}
                    </button>
                </div>
                {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg">{error}</div>}
                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                    {summary ? (
                        <div dangerouslySetInnerHTML={{ __html: formattedSummary! }} />
                    ) : (
                        <p className="text-slate-400">Click the button to generate an AI-powered summary of your analytics data.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;