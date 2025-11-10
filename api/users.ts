import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;

    try {
        if (req.method === 'GET') {
            const users = await db.getUsers();
            // Passwords should not be sent to the client.
            return res.status(200).json(users);
        }
        
        if (req.method === 'POST') {
            const newUser = await db.addUser(req.body);
            return res.status(201).json(newUser);
        }

        if (req.method === 'PUT') {
            if (!id) return res.status(400).json({ error: 'User ID is required' });
            await db.putUser({ ...req.body, id });
            return res.status(200).json({ success: true });
        }
        
        if (req.method === 'DELETE') {
            if (!id) return res.status(400).json({ error: 'User ID is required' });
            await db.deleteUser(id as string);
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (error: any) {
        console.error('User API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}