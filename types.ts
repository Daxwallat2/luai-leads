// Fix: Define all necessary types for the application to resolve import errors.
export type Page = 'dashboard' | 'leads' | 'buyers' | 'delivery' | 'analytics' | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Password is for simulation, optional on the type
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
  date: string;
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
    markets: string[];
    leadQualificationPreference: 'Qualified' | 'Not Qualified' | 'Both';
}

export interface DeliveryLog {
    id: string;
    timestamp: string;
    leadId: string;
    buyerId: string;
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

export interface Campaign {
    id: string;
    name: string;
    status: 'Active' | 'Paused' | 'Completed';
    leads: number;
    cost: number;
    cpl: number;
}

// Fix: Add a global type declaration for the Recharts library, which is loaded from a CDN.
// This resolves 'Property 'Recharts' does not exist on type 'Window & typeof globalThis'' errors.
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Recharts: any;
  }
}