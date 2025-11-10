import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'GET') {
            const logs = await db.getDeliveryLogs();
            return res.status(200).json(logs);
        }
        
        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error: any) {
        console.error('Delivery Log API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
