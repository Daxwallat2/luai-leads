import { parseAddressWithGemini } from "./services/geminiService";
import type { Lead, Buyer, DeliveryLog, DailyLeads, User } from "./types";

const DB_NAME = "luaiLeadsDB";
const DB_VERSION = 1;

let db: IDBDatabase;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains('leads')) {
                dbInstance.createObjectStore('leads', { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains('buyers')) {
                dbInstance.createObjectStore('buyers', { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains('delivery_logs')) {
                 dbInstance.createObjectStore('delivery_logs', { keyPath: 'id', autoIncrement: true });
            }
             if (!dbInstance.objectStoreNames.contains('users')) {
                dbInstance.createObjectStore('users', { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains('app_state')) {
                dbInstance.createObjectStore('app_state', { keyPath: 'key' });
            }
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error("Database error:", (event.target as IDBOpenDBRequest).error);
            reject("Database error");
        };
    });
};

const seedInitialData = async (): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(['leads', 'buyers', 'users'], 'readwrite');
    const leadsStore = transaction.objectStore('leads');
    const buyersStore = transaction.objectStore('buyers');
    const usersStore = transaction.objectStore('users');

    const leadsCount = await new Promise<number>((resolve) => {
        const req = leadsStore.count();
        req.onsuccess = () => resolve(req.result);
    });

    if (leadsCount === 0) {
        // Seed Buyers
        const initialBuyers: Omit<Buyer, 'id'>[] = [
            { name: "Statewide Solar", status: 'Active', webhookUrl: 'https://example.com/webhook/solar', monthlyCap: 100, leadsSentThisMonth: 23, cycleStartDate: '2023-05-01', markets: ['California', 'Arizona', 'Nevada'], leadQualificationPreference: 'Qualified' },
            { name: "Roofer's Choice", status: 'Active', webhookUrl: 'https://example.com/webhook/roofing', monthlyCap: 250, leadsSentThisMonth: 150, cycleStartDate: '2023-05-01', markets: ['Texas', 'Florida'], leadQualificationPreference: 'Both' },
            { name: "Kitchen Remodel Pro", status: 'Inactive', webhookUrl: 'https://example.com/webhook/kitchen', monthlyCap: 50, leadsSentThisMonth: 50, cycleStartDate: '2023-05-01', markets: ['New York'], leadQualificationPreference: 'Qualified' },
        ];
        initialBuyers.forEach(b => buyersStore.add({ ...b, id: crypto.randomUUID() }));

        // Seed Leads
        const initialLeads: Omit<Lead, 'id'>[] = [
            { name: "John Smith", email: "john.s@example.com", phone: "123-456-7890", source: "Google Ads", status: "Qualified", deliveryStatus: 'Delivered', createdAt: "2023-05-15T10:00:00Z", street: "123 Main St", city: "Los Angeles", state: "California", zipCode: "90001", notes: [] },
            { name: "Maria Garcia", email: "maria.g@example.com", phone: "234-567-8901", source: "Facebook", status: "Not Qualified", deliveryStatus: 'Pending', createdAt: "2023-05-14T11:30:00Z", street: "456 Oak Ave", city: "Miami", state: "Florida", zipCode: "33101", notes: [] },
            { name: "David Johnson", email: "david.j@example.com", phone: "345-678-9012", source: "Organic", status: "Qualified", deliveryStatus: 'Failed', createdAt: "2023-05-13T09:00:00Z", street: "789 Pine Rd", city: "Houston", state: "Texas", zipCode: "77001", notes: [] }
        ];
        initialLeads.forEach(l => leadsStore.add({ ...l, id: crypto.randomUUID() }));

        // Seed Users
        const initialUsers: Omit<User, 'id'>[] = [
            { name: 'Admin User', role: 'Admin' },
            { name: 'Standard User', role: 'User' }
        ];
        initialUsers.forEach(u => usersStore.add({ ...u, id: crypto.randomUUID() }));
    }
};

export const initDB = async (): Promise<void> => {
    await openDB();
    await seedInitialData();
};

// Generic CRUD operations
const getAll = <T>(storeName: string): Promise<T[]> => {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const add = <T>(storeName: string, item: T): Promise<void> => {
     return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add({ ...item, id: crypto.randomUUID() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const update = <T extends {id: string}>(storeName: string, item: T): Promise<void> => {
     return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const deleteItems = (storeName: string, ids: string[]): Promise<void[]> => {
    return Promise.all(ids.map(id => new Promise<void>(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    })));
};

// Specific functions
export const getAllLeads = (): Promise<Lead[]> => getAll<Lead>('leads');
export const addLead = (lead: Omit<Lead, 'id'>): Promise<void> => add<Omit<Lead, 'id'>>('leads', lead);
export const updateLead = (lead: Lead): Promise<void> => update<Lead>('leads', lead);
export const deleteLeads = (ids: string[]): Promise<void[]> => deleteItems('leads', ids);


export const getAllBuyers = (): Promise<Buyer[]> => getAll<Buyer>('buyers');
export const addBuyer = (buyer: Omit<Buyer, 'id'>): Promise<void> => add<Omit<Buyer, 'id'>>('buyers', buyer);
export const updateBuyer = (buyer: Buyer): Promise<void> => update<Buyer>('buyers', buyer);
export const deleteBuyers = (ids: string[]): Promise<void[]> => deleteItems('buyers', ids);
export const updateBuyerLeadsSent = async (buyerId: string, newCount: number): Promise<void> => {
    const buyers = await getAllBuyers();
    const buyer = buyers.find(b => b.id === buyerId);
    if (buyer) {
        await updateBuyer({ ...buyer, leadsSentThisMonth: newCount });
    }
};

export const getDeliveryLog = (): Promise<DeliveryLog[]> => getAll<DeliveryLog>('delivery_logs');
export const addDeliveryLog = (log: Omit<DeliveryLog, 'id'>): Promise<void> => add<Omit<DeliveryLog, 'id'>>('delivery_logs', log);

export const getAllUsers = (): Promise<User[]> => getAll<User>('users');
export const addUser = (user: Omit<User, 'id'>): Promise<void> => add<Omit<User, 'id'>>('users', user);
export const updateUser = (user: User): Promise<void> => update<User>('users', user);

// App state management
export const setCurrentUser = async (userId: string): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('app_state', 'readwrite');
    transaction.objectStore('app_state').put({ key: 'currentUser', value: userId });
};

export const getCurrentUser = async (): Promise<User | null> => {
    const db = await openDB();
    const transaction = db.transaction(['app_state', 'users'], 'readonly');
    const appStateStore = transaction.objectStore('app_state');
    
    return new Promise((resolve) => {
        const req = appStateStore.get('currentUser');
        req.onsuccess = async () => {
            if (req.result) {
                const userId = req.result.value;
                const usersStore = transaction.objectStore('users');
                const userReq = usersStore.get(userId);
                userReq.onsuccess = () => resolve(userReq.result || null);
            } else {
                 const users = await getAllUsers();
                 if (users.length > 0) {
                     await setCurrentUser(users[0].id);
                     resolve(users[0]);
                 } else {
                    resolve(null);
                 }
            }
        };
    });
};

export const clearCurrentUser = async (): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction('app_state', 'readwrite');
    transaction.objectStore('app_state').delete('currentUser');
}

// Complex logic
export const getDailyLeads = async (): Promise<DailyLeads[]> => {
    const leads = await getAllLeads();
    const counts: { [key: string]: number } = {};
    leads.forEach(lead => {
        const date = new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        counts[date] = (counts[date] || 0) + 1;
    });

    return Object.entries(counts)
        .map(([date, count]) => ({ date, count }))
        // FIX: The right-hand side of the subtraction was a Date object, not a number. Added .getTime().
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};


export const processAndDistributeLead = async (leadData: any): Promise<void> => {
    const { address, ...restOfLeadData } = leadData;
    let enrichedLeadData = { ...restOfLeadData };

    if (address) {
        try {
            const parsedAddress = await parseAddressWithGemini(address);
            enrichedLeadData = {
                ...enrichedLeadData,
                street: parsedAddress.street,
                city: parsedAddress.city,
                state: parsedAddress.state,
                zipCode: parsedAddress.zipCode
            };
        } catch (error) {
            console.error("Could not parse address with AI, using raw address.", error);
            enrichedLeadData.street = address; // fallback
        }
    }
    
     const newLead: Omit<Lead, 'id'> = {
        name: enrichedLeadData.name || "Unknown",
        email: enrichedLeadData.email || "N/A",
        phone: enrichedLeadData.phone || "N/A",
        source: enrichedLeadData.source || "Webhook",
        status: enrichedLeadData.status || "Qualified",
        deliveryStatus: 'Pending',
        createdAt: new Date().toISOString(),
        street: enrichedLeadData.street || "",
        city: enrichedLeadData.city || "",
        state: enrichedLeadData.state || "",
        zipCode: enrichedLeadData.zipCode || "",
        notes: enrichedLeadData.notes || []
    };
    
    // Add lead to DB to get an ID
    const db = await openDB();
    const leadTx = db.transaction('leads', 'readwrite');
    const leadsStore = leadTx.objectStore('leads');
    const leadId = crypto.randomUUID();
    leadsStore.add({ ...newLead, id: leadId });

    // Find eligible buyers
    const buyers = await getAllBuyers();
    const isLeadQualified = newLead.status === 'Qualified';
    
    const eligibleBuyers = buyers.filter(buyer => 
        buyer.status === 'Active' &&
        buyer.leadsSentThisMonth < buyer.monthlyCap &&
        buyer.markets.includes(newLead.state) &&
        (buyer.leadQualificationPreference === 'Both' || 
         (buyer.leadQualificationPreference === 'Qualified' && isLeadQualified) ||
         (buyer.leadQualificationPreference === 'Not Qualified' && !isLeadQualified))
    );

    if (eligibleBuyers.length === 0) {
        await updateLead({ ...newLead, id: leadId, deliveryStatus: 'Failed' });
        await addDeliveryLog({ timestamp: new Date().toISOString(), leadId: leadId, buyerId: null, status: 'Failed', response: 'No eligible buyers found.' });
        return;
    }

    // Simple round-robin or random distribution
    const buyerToDistribute = eligibleBuyers[Math.floor(Math.random() * eligibleBuyers.length)];

    try {
        if (!buyerToDistribute.webhookUrl) throw new Error("Buyer has no webhook URL.");
        
        // In a real app, you would await this and handle the response.
        // For simulation, we'll just fire and forget.
        fetch(buyerToDistribute.webhookUrl, {
            method: 'POST',
            body: JSON.stringify({ ...newLead, id: leadId }),
            headers: { 'Content-Type': 'application/json' },
            mode: 'no-cors' // Important for simulation to avoid CORS errors on external URLs
        });
        
        await updateLead({ ...newLead, id: leadId, deliveryStatus: 'Delivered' });
        await updateBuyer({ ...buyerToDistribute, leadsSentThisMonth: buyerToDistribute.leadsSentThisMonth + 1 });
        await addDeliveryLog({ timestamp: new Date().toISOString(), leadId, buyerId: buyerToDistribute.id, status: 'Success', response: 'Successfully sent to buyer webhook.' });
    } catch (error: any) {
        await updateLead({ ...newLead, id: leadId, deliveryStatus: 'Failed' });
        await addDeliveryLog({ timestamp: new Date().toISOString(), leadId, buyerId: buyerToDistribute.id, status: 'Failed', response: error.message });
    }
};