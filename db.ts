import type { User, Lead, Buyer, DeliveryLog } from './types';
import { US_STATES } from './data/locations';

const DB_NAME = 'LUAILeadsDB';
const DB_VERSION = 1;

// --- Mock Data Generation (for initial seeding) ---

const randomDate = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const generateMockLeads = (count: number): Lead[] => {
    const leads: Lead[] = [];
    const sources = ['Organic Search', 'Facebook Ads', 'Google Ads', 'Referral', 'LinkedIn'];
    const statuses: Lead['status'][] = ['Qualified', 'Not Qualified'];
    const deliveryStatuses: Lead['deliveryStatus'][] = ['Pending', 'Queued', 'Delivered', 'Failed'];
    const names = ['Alice Johnson', 'Bob Williams', 'Charlie Brown', 'Diana Prince', 'Ethan Hunt', 'Fiona Gallagher', 'George Costanza', 'Heidi Klum', 'Ivan Drago', 'Jane Doe'];
    const streetNames = ['Main', 'Oak', 'Pine', 'Maple', 'Elm', 'Cedar'];
    
    for (let i = 1; i <= count; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const randomState = US_STATES[Math.floor(Math.random() * US_STATES.length)];
        const randomCity = `${randomState.replace(/\s/g, '')}ville`;

        leads.push({
            id: i.toString(),
            name: names[Math.floor(Math.random() * names.length)],
            email: `lead${i}@example.com`,
            phone: `(${Math.floor(Math.random() * 800) + 200}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            source: sources[Math.floor(Math.random() * sources.length)],
            status: status,
            deliveryStatus: deliveryStatuses[Math.floor(Math.random() * deliveryStatuses.length)],
            date: randomDate(),
            street: `${Math.floor(Math.random() * 2000) + 1} ${streetNames[Math.floor(Math.random() * streetNames.length)]} St`,
            city: randomCity,
            state: randomState,
            zipCode: (Math.floor(Math.random() * 90000) + 10000).toString(),
            notes: [],
        });
    }
    return leads;
};

const generateMockBuyers = (count: number): Buyer[] => {
    const buyers: Buyer[] = [];
    const preferences: Buyer['leadQualificationPreference'][] = ['Qualified', 'Not Qualified', 'Both'];
    for(let i=1; i <= count; i++) {
        const monthlyCap = (Math.floor(Math.random() * 41) + 10) * 10;
        const leadsSent = Math.floor(Math.random() * monthlyCap);
        const numMarkets = Math.floor(Math.random() * 5) + 1;
        const markets = new Set<string>();
        while(markets.size < numMarkets) {
            markets.add(US_STATES[Math.floor(Math.random() * US_STATES.length)]);
        }
        buyers.push({
            id: `b${i}`, name: `Buyer Inc. #${i}`, status: Math.random() > 0.2 ? 'Active' : 'Inactive',
            webhookUrl: `https://webhook.site/d9a8c6b7-a8b2-4c9c-b1f5-e0d6a5f9b4c1`,
            monthlyCap: monthlyCap, leadsSentThisMonth: leadsSent,
            cycleStartDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], markets: Array.from(markets),
            leadQualificationPreference: preferences[Math.floor(Math.random() * preferences.length)]
        });
    }
    return buyers;
};

const generateMockDeliveryLogs = (leads: Lead[], buyers: Buyer[]): DeliveryLog[] => {
    return leads
        .filter(lead => lead.deliveryStatus === 'Delivered' || lead.deliveryStatus === 'Failed')
        .map(lead => ({
            id: `dl-${lead.id}`, timestamp: new Date(new Date(lead.date).getTime() + Math.random() * 1000 * 60 * 5).toISOString(),
            leadId: lead.id, buyerId: lead.deliveryStatus === 'Delivered' ? buyers[Math.floor(Math.random() * buyers.length)].id : 'N/A',
            status: lead.deliveryStatus === 'Delivered' ? 'Success' : 'Failed',
            response: lead.deliveryStatus === 'Delivered' ? `{"status":"success", "lead_id": "${lead.id}"}` : '{"status":"error", "message":"Duplicate lead"}'
        }));
};

const initialUsers: User[] = [
    { id: 'u1', name: 'Admin User', email: 'admin@luaileads.dev', password: 'password', role: 'Admin' }
];
const initialLeads = generateMockLeads(50);
const initialBuyers = generateMockBuyers(8);
const initialDeliveryLogs = generateMockDeliveryLogs(initialLeads, initialBuyers);

// --- DB Initialization and Seeding ---

// FIX: Renamed `db` to `dbInstance` to avoid redeclaration error with exported `db` object.
let dbInstance: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (dbInstance) return resolve(dbInstance);

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => { dbInstance = request.result; resolve(dbInstance); };
        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (!tempDb.objectStoreNames.contains('users')) tempDb.createObjectStore('users', { keyPath: 'id' });
            if (!tempDb.objectStoreNames.contains('leads')) tempDb.createObjectStore('leads', { keyPath: 'id' });
            if (!tempDb.objectStoreNames.contains('buyers')) tempDb.createObjectStore('buyers', { keyPath: 'id' });
            if (!tempDb.objectStoreNames.contains('deliveryLog')) tempDb.createObjectStore('deliveryLog', { keyPath: 'id' });
        };
    });
};

const seedDatabase = async () => {
    const db = await initDB();
    const transaction = db.transaction(['users'], 'readonly');
    const userCount = await new Promise<number>((resolve, reject) => {
        const request = transaction.objectStore('users').count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    if (userCount > 0) return;

    console.log('Seeding database...');
    const seedTx = db.transaction(['users', 'leads', 'buyers', 'deliveryLog'], 'readwrite');
    const stores = {
        users: seedTx.objectStore('users'),
        leads: seedTx.objectStore('leads'),
        buyers: seedTx.objectStore('buyers'),
        deliveryLog: seedTx.objectStore('deliveryLog'),
    };

    initialUsers.forEach(user => stores.users.add(user));
    initialLeads.forEach(lead => stores.leads.add(lead));
    initialBuyers.forEach(buyer => stores.buyers.add(buyer));
    initialDeliveryLogs.forEach(log => stores.deliveryLog.add(log));

    return new Promise<void>((resolve, reject) => {
        seedTx.oncomplete = () => resolve();
        seedTx.onerror = () => reject(seedTx.error);
    });
};

export const loadAndSeedDB = async () => {
    await initDB();
    await seedDatabase();
};

// --- DB CRUD Helpers ---

const getStoreData = <T>(storeName: string): Promise<T[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const request = db.transaction([storeName], 'readonly').objectStore(storeName).getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
    });
};

const addStoreData = <T>(storeName: string, data: T): Promise<void> => {
     return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const request = db.transaction([storeName], 'readwrite').objectStore(storeName).add(data);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

const putStoreData = <T>(storeName: string, data: T): Promise<void> => {
     return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const request = db.transaction([storeName], 'readwrite').objectStore(storeName).put(data);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

const deleteStoreData = (storeName: string, id: string): Promise<void> => {
     return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const request = db.transaction([storeName], 'readwrite').objectStore(storeName).delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export const db = {
    getUsers: () => getStoreData<User>('users'),
    addUser: (user: User) => addStoreData('users', user),
    putUser: (user: User) => putStoreData('users', user),
    deleteUser: (id: string) => deleteStoreData('users', id),

    getLeads: () => getStoreData<Lead>('leads'),
    addLead: (lead: Lead) => addStoreData('leads', lead),
    putLead: (lead: Lead) => putStoreData('leads', lead),
    deleteLeads: (ids: string[]) => Promise.all(ids.map(id => deleteStoreData('leads', id))),

    getBuyers: () => getStoreData<Buyer>('buyers'),
    addBuyer: (buyer: Buyer) => addStoreData('buyers', buyer),
    putBuyer: (buyer: Buyer) => putStoreData('buyers', buyer),
    deleteBuyers: (ids: string[]) => Promise.all(ids.map(id => deleteStoreData('buyers', id))),

    getDeliveryLogs: () => getStoreData<DeliveryLog>('deliveryLog'),
    addDeliveryLog: (log: DeliveryLog) => addStoreData('deliveryLog', log),
    deleteLogsForLeads: async (leadIds: string[]) => {
        const logs = await getStoreData<DeliveryLog>('deliveryLog');
        const logsToDelete = logs.filter(log => leadIds.includes(log.leadId));
        return Promise.all(logsToDelete.map(log => deleteStoreData('deliveryLog', log.id)));
    },
     deleteLogsForBuyers: async (buyerIds: string[]) => {
        const logs = await getStoreData<DeliveryLog>('deliveryLog');
        const logsToDelete = logs.filter(log => log.buyerId && buyerIds.includes(log.buyerId));
        return Promise.all(logsToDelete.map(log => deleteStoreData('deliveryLog', log.id)));
    },
};