import React, { useMemo } from 'react';
import type { Lead, DailyLeads, Buyer } from '../../types';
import StatCard from '../StatCard';
import LeadChart from '../LeadChart';
import RecentLeadsTable from '../RecentLeadsTable';
import { BuyerIcon, LeadsIcon, TargetIcon } from '../Icons';
import LeadsNeededByState from '../LeadsNeededByState';

interface DashboardProps {
    leads: Lead[];
    buyers: Buyer[];
    dailyLeads: DailyLeads[];
}

const Dashboard: React.FC<DashboardProps> = ({ leads, buyers, dailyLeads }) => {
    const activeBuyers = buyers.filter(b => b.status === 'Active');
    const activeBuyersCount = activeBuyers.length;
    
    const { totalNeeded, qualifiedNeeded, notQualifiedNeeded } = useMemo(() => {
        let total = 0;
        let qualified = 0;
        let notQualified = 0;

        activeBuyers.forEach(buyer => {
            const remainingCap = buyer.monthlyCap - buyer.leadsSentThisMonth;
            if (remainingCap > 0) {
                total += remainingCap;

                if (['Qualified', 'Both'].includes(buyer.leadQualificationPreference)) {
                    qualified += remainingCap;
                }
                if (['Not Qualified', 'Both'].includes(buyer.leadQualificationPreference)) {
                    notQualified += remainingCap;
                }
            }
        });

        return { totalNeeded: total, qualifiedNeeded: qualified, notQualifiedNeeded: notQualified };
    }, [activeBuyers]);

    const recentLeads = useMemo(() => {
        return [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    }, [leads]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Total Leads"
                    value={leads.length.toLocaleString()}
                    change="12.5%"
                    changeType="increase"
                    icon={<LeadsIcon className="h-6 w-6 text-slate-400" />}
                />
                <StatCard
                    title="Active Buyers"
                    value={activeBuyersCount.toString()}
                    change="+1"
                    changeType="increase"
                    icon={<BuyerIcon className="h-6 w-6 text-slate-400" />}
                />
                <StatCard
                    title="Total Leads Needed"
                    value={totalNeeded.toLocaleString()}
                    change=""
                    changeType="neutral"
                    icon={<TargetIcon className="h-6 w-6 text-slate-400" />}
                    changeSubtitle="across all active buyers"
                />
                <StatCard
                    title="Qualified Leads Needed"
                    value={qualifiedNeeded.toLocaleString()}
                    change=""
                    changeType="neutral"
                    icon={<TargetIcon className="h-6 w-6 text-slate-400" />}
                    changeSubtitle="for buyers accepting qualified"
                />
                <StatCard
                    title="Not Qualified Needed"
                    value={notQualifiedNeeded.toLocaleString()}
                    change=""
                    changeType="neutral"
                    icon={<TargetIcon className="h-6 w-6 text-slate-400" />}
                    changeSubtitle="for buyers accepting not qualified"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LeadsNeededByState buyers={buyers} />
                <LeadChart data={dailyLeads} />
            </div>

            <div className="grid grid-cols-1 gap-8">
                <RecentLeadsTable leads={recentLeads} />
            </div>
        </div>
    );
};

export default Dashboard;