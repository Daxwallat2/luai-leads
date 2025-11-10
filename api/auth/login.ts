import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await db.getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check for admin secret key for easy admin access in production
        const adminSecret = process.env.ADMIN_SECRET_KEY;
        if (adminSecret && user.email === 'admin@luaileads.dev' && password === adminSecret) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _, ...userWithoutPassword } = user;
            return res.status(200).json(userWithoutPassword);
        }

        // Standard password check (in a real app, use bcrypt.compare)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // IMPORTANT: Never return the password in an API response.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);

    } catch (error: any) {
        console.error('Login API Error:', error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
}
