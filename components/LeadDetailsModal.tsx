import React from 'react';
import type { Lead } from '../types';

const statusColors: { [key in Lead['status']]: string } = {
  Qualified: 'bg-green-500/20 text-green-400',
  'Not Qualified': 'bg-red-500/20 text-red-400',
};

const deliveryStatusColors: { [key in Lead['deliveryStatus']]: string } = {
  Pending: 'bg-slate-500/20 text-slate-400',
  Queued: 'bg-cyan-500/20 text-cyan-400',
  Delivered: 'bg-green-500/20 text-green-400',
  Failed: 'bg-red-500/20 text-red-400',
};

interface LeadDetailsModalProps {
    lead: Lead;
    onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-white font-medium">{value}</p>
    </div>
);

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Lead Details: {lead.name}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                     <div className="border-b border-slate-700 pb-4">
                        <h3 className="text-lg font-semibold text-brand-green mb-3">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Name" value={lead.name} />
                            <DetailItem label="Email" value={lead.email} />
                            <DetailItem label="Phone" value={lead.phone} />
                        </div>
                    </div>
                    <div className="border-b border-slate-700 pb-4">
                        <h3 className="text-lg font-semibold text-brand-green mb-3">Lead Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Source" value={lead.source} />
                             <DetailItem label="Status" value={
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                                    {lead.status}
                                </span>
                            } />
                            <DetailItem label="Delivery Status" value={
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${deliveryStatusColors[lead.deliveryStatus]}`}>
                                    {lead.deliveryStatus}
                                </span>
                            } />
                             <DetailItem label="Date Received" value={new Date(lead.createdAt).toLocaleDateString()} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-brand-green mb-3">Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Street" value={lead.street} />
                            <DetailItem label="City" value={lead.city} />
                            <DetailItem label="State" value={lead.state} />
                            <DetailItem label="Zip Code" value={lead.zipCode} />
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-700 flex justify-end">
                    <button onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-500 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadDetailsModal;