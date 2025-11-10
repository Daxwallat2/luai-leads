import { sql } from '@vercel/postgres';
import type { User, Lead, Buyer, DeliveryLog } from '../types';

export async function createTables() {
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        );
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS buyers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            "webhookUrl" TEXT,
            "monthlyCap" INTEGER NOT NULL,
            "leadsSentThisMonth" INTEGER NOT NULL,
            "cycleStartDate" DATE NOT NULL,
            markets TEXT[],
            "leadQualificationPreference" TEXT NOT NULL
        );
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            source TEXT,
            status TEXT NOT NULL,
            "deliveryStatus" TEXT NOT NULL,
            date DATE NOT NULL,
            street TEXT,
            city TEXT,
            state TEXT,
            "zipCode" TEXT,
            notes TEXT[]
        );
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS "deliveryLog" (
            id TEXT PRIMARY KEY,
            timestamp TIMESTAMPTZ NOT NULL,
            "leadId" TEXT NOT NULL,
            "buyerId" TEXT,
            status TEXT NOT NULL,
            response TEXT
        );
    `;
}

let seedingPromise: Promise<void> | null = null;

async function seedInitialData() {
    await createTables();
    const { rows: users } = await sql`SELECT COUNT(*) FROM users`;
    if (Number(users[0].count) === 0) {
        console.log("Seeding initial users...");
        await sql`
            INSERT INTO users (id, name, email, password, role) VALUES
            ('u1', 'Dax', 'Dax@leadsupai.com', 'Dinero81$', 'Admin'),
            ('u2', 'Test User', 'user@luaileads.dev', 'password', 'User');
        `;
    }
}

function ensureSeeded() {
    if (!seedingPromise) {
        seedingPromise = seedInitialData();
    }
    return seedingPromise;
}

export const db = {
    // User Functions
    getUsers: async (): Promise<Omit<User, 'password'>[]> => {
        await ensureSeeded();
        return (await sql<Omit<User, 'password'>>`SELECT id, name, email, role FROM users`).rows;
    },
    getUserByEmail: async (email: string): Promise<User | undefined> => {
        await ensureSeeded();
        const result = await sql<User>`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
        return result.rows[0];
    },
    addUser: async (user: Omit<User, 'id'>) => {
        await ensureSeeded();
        const id = `u${Date.now()}`;
        await sql`INSERT INTO users (id, name, email, password, role) VALUES (${id}, ${user.name}, ${user.email}, ${user.password}, ${user.role})`;
        return { ...user, id };
    },
    putUser: async (user: User) => {
        await ensureSeeded();
        if (user.password) {
            return sql`UPDATE users SET name = ${user.name}, email = ${user.email}, password = ${user.password}, role = ${user.role} WHERE id = ${user.id}`;
        } else {
            return sql`UPDATE users SET name = ${user.name}, email = ${user.email}, role = ${user.role} WHERE id = ${user.id}`;
        }
    },
    deleteUser: async (id: string) => {
        await ensureSeeded();
        return sql`DELETE FROM users WHERE id = ${id}`;
    },

    // Buyer Functions
    getBuyers: async (): Promise<Buyer[]> => {
        await ensureSeeded();
        return (await sql<Buyer>`SELECT * FROM buyers`).rows;
    },
    addBuyer: async (buyer: Omit<Buyer, 'id'>) => {
        await ensureSeeded();
        const id = `b${Date.now()}`;
        // Fix: Cast array to 'any' to bypass overly strict type checking in @vercel/postgres.
        await sql`INSERT INTO buyers (id, name, status, "webhookUrl", "monthlyCap", "leadsSentThisMonth", "cycleStartDate", markets, "leadQualificationPreference") VALUES (${id}, ${buyer.name}, ${buyer.status}, ${buyer.webhookUrl}, ${buyer.monthlyCap}, ${buyer.leadsSentThisMonth}, ${buyer.cycleStartDate}, ${buyer.markets as any}, ${buyer.leadQualificationPreference})`;
        return { ...buyer, id };
    },
    putBuyer: async (buyer: Buyer) => {
        await ensureSeeded();
        // Fix: Cast array to 'any' to bypass overly strict type checking in @vercel/postgres.
        return sql`UPDATE buyers SET name = ${buyer.name}, status = ${buyer.status}, "webhookUrl" = ${buyer.webhookUrl}, "monthlyCap" = ${buyer.monthlyCap}, "leadsSentThisMonth" = ${buyer.leadsSentThisMonth}, "cycleStartDate" = ${buyer.cycleStartDate}, markets = ${buyer.markets as any}, "leadQualificationPreference" = ${buyer.leadQualificationPreference} WHERE id = ${buyer.id}`;
    },
    deleteBuyers: async (ids: string[]) => {
        await ensureSeeded();
        // Fix: Cast array to 'any' to bypass overly strict type checking in @vercel/postgres.
        return sql`DELETE FROM buyers WHERE id = ANY(${ids as any})`;
    },
    resetMonthlyCounts: async () => {
        await ensureSeeded();
        return sql`UPDATE buyers SET "leadsSentThisMonth" = 0`;
    },
    incrementBuyerLeadCount: async (id: string) => {
        await ensureSeeded();
        return sql`UPDATE buyers SET "leadsSentThisMonth" = "leadsSentThisMonth" + 1 WHERE id = ${id}`;
    },

    // Lead Functions
    getLeads: async (): Promise<Lead[]> => {
        await ensureSeeded();
        return (await sql<Lead>`SELECT * FROM leads`).rows;
    },
    addLead: async (lead: Omit<Lead, 'id' | 'deliveryStatus' | 'date'>): Promise<Lead> => {
        await ensureSeeded();
        const id = `lead-${Date.now()}`;
        const date = new Date().toISOString().split('T')[0];
        const deliveryStatus: Lead['deliveryStatus'] = 'Pending';
        // Fix: Cast array to 'any' to bypass overly strict type checking in @vercel/postgres.
        await sql`INSERT INTO leads (id, name, email, phone, source, status, "deliveryStatus", date, street, city, state, "zipCode", notes) VALUES (${id}, ${lead.name}, ${lead.email}, ${lead.phone}, ${lead.source}, ${lead.status}, ${deliveryStatus}, ${date}, ${lead.street}, ${lead.city}, ${lead.state}, ${lead.zipCode}, ${lead.notes as any})`;
        return { ...lead, id, date, deliveryStatus };
    },
    putLead: async (lead: Lead) => {
        await ensureSeeded();
        // Fix: Cast array to 'any' to bypass overly strict type checking in @vercel/postgres.
        return sql`UPDATE leads SET name = ${lead.name}, email = ${lead.email}, phone = ${lead.phone}, source = ${lead.source}, status = ${lead.status}, street = ${lead.street}, city = ${lead.city}, state = ${lead.state}, "zipCode" = ${lead.zipCode}, notes = ${lead.notes as any} WHERE id = ${lead.id}`;
    },
    deleteLeads: async (ids: string[]) => {
        await ensureSeeded();
        // Fix: Cast array to 'any' to bypass overly strict type checking in @vercel/postgres.
        return sql`DELETE FROM leads WHERE id = ANY(${ids as any})`;
    },
    updateLeadDeliveryStatus: async (id: string, status: Lead['deliveryStatus']) => {
        await ensureSeeded();
        return sql`UPDATE leads SET "deliveryStatus" = ${status} WHERE id = ${id}`;
    },

    // DeliveryLog Functions
    getDeliveryLogs: async (): Promise<DeliveryLog[]> => {
        await ensureSeeded();
        return (await sql<DeliveryLog>`SELECT * FROM "deliveryLog"`).rows;
    },
    addDeliveryLog: async (log: Omit<DeliveryLog, 'id' | 'timestamp'>) => {
        await ensureSeeded();
        const id = `dl-${Date.now()}`;
        const timestamp = new Date().toISOString();
        await sql`INSERT INTO "deliveryLog" (id, timestamp, "leadId", "buyerId", status, response) VALUES (${id}, ${timestamp}, ${log.leadId}, ${log.buyerId}, ${log.status}, ${log.response})`;
        return { ...log, id, timestamp };
    },
};
