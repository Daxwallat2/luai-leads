import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;

    try {
        if (req.method === 'GET') {
            const leads = await db.getLeads();
            return res.status(200).json(leads);
        }
        
        if (req.method === 'PUT') {
            if (!id) return res.status(400).json({ error: 'Lead ID is required' });
            await db.putLead({ ...req.body, id });
            return res.status(200).json({ success: true });
        }
        
        if (req.method === 'DELETE') {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'An array of lead IDs is required' });
            await db.deleteLeads(ids);
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error: any) {
        console.error('Leads API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
