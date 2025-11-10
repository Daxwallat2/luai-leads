import React, { useMemo } from 'react';
import type { Lead, DailyLeads, Buyer } from '../../types';
import StatCard from '../StatCard';
import LeadChart from '../LeadChart';
import RecentLeadsTable from '../RecentLeadsTable';
import { BuyerIcon, LeadsIcon, TargetIcon } from '../Icons';
import LeadsNeededByState from '../LeadsNeededByState';

interface DashboardProps {
    buyers: Buyer[];
}

const mockDailyLeads: DailyLeads[] = [
    { date: '1-May', count: 54 }, { date: '2-May', count: 62 },
    { date: '3-May', count: 58 }, { date: '4-May', count: 78 },
    { date: '5-May', count: 71 }, { date: '6-May', count: 85 },
    { date: '7-May', count: 92 },
];

// FIX: Added missing 'deliveryStatus' property to each lead object to conform to the Lead type.
// Fix: Added missing 'location' property to each mock lead to match the 'Lead' type definition.
// Fix: Added missing 'notes' property to each lead object to conform to the Lead type.
const mockRecentLeads: Lead[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', phone: '(555) 123-4567', source: 'Organic Search', status: 'Qualified', deliveryStatus: 'Delivered', date: '2024-05-07', street: '123 Main St', city: 'New York', state: 'New York', zipCode: '10001', notes: [] },
    { id: '2', name: 'Bob Williams', email: 'bob@example.com', phone: '(555) 987-6543', source: 'Facebook Ads', status: 'Not Qualified', deliveryStatus: 'Pending', date: '2024-05-07', street: '456 Oak Ave', city: 'Los Angeles', state: 'California', zipCode: '90001', notes: [] },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '(555) 234-5678', source: 'Referral', status: 'Not Qualified', deliveryStatus: 'Failed', date: '2024-05-06', street: '789 Pine Ln', city: 'Chicago', state: 'Illinois', zipCode: '60601', notes: [] },
    { id: '4', name: 'Diana Prince', email: 'diana@example.com', phone: '(555) 876-5432', source: 'Google Ads', status: 'Not Qualified', deliveryStatus: 'Delivered', date: '2024-05-06', street: '101 Maple Dr', city: 'Houston', state: 'Texas', zipCode: '77001', notes: [] },
    { id: '5', name: 'Ethan Hunt', email: 'ethan@example.com', phone: '(555) 345-6789', source: 'Organic Search', status: 'Qualified', deliveryStatus: 'Delivered', date: '2024-05-05', street: '212 Elm Ct', city: 'Phoenix', state: 'Arizona', zipCode: '85001', notes: [] },
];

const Dashboard: React.FC<DashboardProps> = ({ buyers }) => {
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


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Total Leads"
                    value="12,875"
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
                <LeadChart data={mockDailyLeads} />
            </div>

            <div className="grid grid-cols-1 gap-8">
                <RecentLeadsTable leads={mockRecentLeads} />
            </div>
        </div>
    );
};

export default Dashboard;