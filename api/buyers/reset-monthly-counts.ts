import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await db.resetMonthlyCounts();
        return res.status(200).json({ success: true, message: 'Monthly counts reset for all buyers.' });
    } catch (error: any) {
        console.error('Reset Counts API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
