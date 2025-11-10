// types.ts
export type Page = 'dashboard' | 'leads' | 'buyers' | 'delivery' | 'analytics' | 'settings';

// Represents the public user profile stored in Supabase
export interface UserProfile {
  id: string; // Corresponds to the auth.users id
  full_name: string;
  email: string; // Stored for convenience, but auth.users is the source of truth
  role: 'Admin' | 'User';
  updated_at?: string;
  avatar_url?: string;
}

export interface Lead {
  id?: string; // Optional for new leads
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'Qualified' | 'Not Qualified';
  delivery_status: 'Pending' | 'Queued' | 'Delivered' | 'Failed';
  created_at?: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string[];
}

export interface Buyer {
    id?: string; // Optional for new buyers
    name: string;
    status: 'Active' | 'Inactive';
    webhook_url: string;
    monthly_cap: number;
    leads_sent_this_month: number;
    cycle_start_date: string;
    markets: string[]; // Array of state names
    lead_qualification_preference: 'Qualified' | 'Not Qualified' | 'Both';
    user_id?: string; // Foreign key to auth.users
}

export interface DeliveryLog {
    id?: string;
    created_at?: string;
    lead_id: string;
    buyer_id: string | null;
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
