// types.ts
export type Page = 'dashboard' | 'leads' | 'buyers' | 'delivery' | 'analytics' | 'settings';

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'User';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'Qualified' | 'Not Qualified';
  deliveryStatus: 'Pending' | 'Queued' | 'Delivered' | 'Failed';
  createdAt: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string[];
}

export interface Buyer {
    id: string;
    name: string;
    status: 'Active' | 'Inactive';
    webhookUrl: string;
    monthlyCap: number;
    leadsSentThisMonth: number;
    cycleStartDate: string;
    markets: string[]; // Array of state names
    leadQualificationPreference: 'Qualified' | 'Not Qualified' | 'Both';
}

export interface DeliveryLog {
    id: string;
    timestamp: string;
    leadId: string;
    buyerId: string | null;
    status: 'Success' | 'Failed';
    response: string;
}

export interface DailyLeads {
    date: string;
    count: number;
}

export interface LeadsBySource {
    source: string;
    value: number;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Recharts: any;
  }
}
