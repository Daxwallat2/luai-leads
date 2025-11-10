import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  changeSubtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, changeSubtitle = 'vs last month' }) => {
    const isIncrease = changeType === 'increase';
    const isDecrease = changeType === 'decrease';

    let changeColor = 'text-slate-400'; // Default for neutral
    if (isIncrease) {
        changeColor = 'text-green-400';
    } else if (isDecrease) {
        changeColor = 'text-red-400';
    }

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value}</p>
                </div>
                <div className="bg-slate-700 p-3 rounded-full">
                    {icon}
                </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
                <span className={`flex items-center font-semibold ${changeColor}`}>
                    {isIncrease && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    )}
                    {isDecrease && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    )}
                    {change}
                </span>
                <span className="text-slate-500 ml-2">{changeSubtitle}</span>
            </div>
        </div>
    );
};

export default StatCard;