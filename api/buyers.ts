import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;

    try {
        if (req.method === 'GET') {
            const buyers = await db.getBuyers();
            return res.status(200).json(buyers);
        }
        
        if (req.method === 'POST') {
            const newBuyer = await db.addBuyer(req.body);
            return res.status(201).json(newBuyer);
        }

        if (req.method === 'PUT') {
            if (!id) return res.status(400).json({ error: 'Buyer ID is required' });
            await db.putBuyer({ ...req.body, id });
            return res.status(200).json({ success: true });
        }
        
        if (req.method === 'DELETE') {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'An array of buyer IDs is required' });
            await db.deleteBuyers(ids);
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error: any) {
        console.error('Buyers API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
