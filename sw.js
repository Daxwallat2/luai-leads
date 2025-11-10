// sw.js

const CACHE_NAME = 'luai-leads-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  // Note: Add other static assets here if you have them (e.g., CSS, images)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // If it's a webhook POST request, intercept it
  if (event.request.method === 'POST' && url.pathname.startsWith('/api/v1/webhooks/in/')) {
    event.respondWith(handleWebhook(event.request));
  } else {
    // For other requests, serve from cache or network
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  }
});

async function handleWebhook(request) {
  try {
    const leadData = await request.json();
    
    // We can't directly call the db.ts functions here because the service worker
    // runs in a different context. We need to communicate with the client (the open tab).
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    if (clients && clients.length > 0) {
      // Send message to the first available client
      clients[0].postMessage({
        type: 'PROCESS_LEAD',
        payload: leadData
      });

       // Also, let's process it here using IndexedDB directly if possible, for robustness
       await processLeadInBackground(leadData);

      return new Response(JSON.stringify({ success: true, message: 'Lead received and queued for processing.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // If no client is open, we can still try to process it in the background
      await processLeadInBackground(leadData);
      return new Response(JSON.stringify({ success: true, message: 'Lead received for background processing.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


// --- Minimalistic IndexedDB logic duplicated for SW context ---
// This ensures webhooks work even if the app tab is closed.

const DB_NAME_SW = "luaiLeadsDB";
const DB_VERSION_SW = 1;

const openDB_SW = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME_SW, DB_VERSION_SW);
    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
};

async function processLeadInBackground(leadData) {
    // This function mimics the logic from db.ts's processAndDistributeLead
    // It is self-contained within the service worker
    const db = await openDB_SW();

    const leadTx = db.transaction(['leads', 'buyers', 'delivery_logs'], 'readwrite');
    const leadsStore = leadTx.objectStore('leads');
    const buyersStore = leadTx.objectStore('buyers');
    const logsStore = leadTx.objectStore('delivery_logs');
    
    const newLeadData = {
        id: crypto.randomUUID(),
        name: leadData.name || "Unknown",
        email: leadData.email || "N/A",
        phone: leadData.phone || "N/A",
        source: leadData.source || "Webhook",
        status: leadData.status || "Qualified",
        deliveryStatus: 'Pending',
        createdAt: new Date().toISOString(),
        street: leadData.address || "", // Simplified for SW
        city: "", state: "", zipCode: "",
        notes: leadData.notes || []
    };

    leadsStore.add(newLeadData);

    const buyers = await new Promise(resolve => {
        const req = buyersStore.getAll();
        req.onsuccess = () => resolve(req.result);
    });

    const eligibleBuyers = buyers.filter(b => b.status === 'Active' && b.leadsSentThisMonth < b.monthlyCap);

    if (eligibleBuyers.length > 0) {
        const buyer = eligibleBuyers[0]; // Simple logic: first come, first served
        
        // Update buyer
        buyer.leadsSentThisMonth += 1;
        const buyerTx = db.transaction('buyers', 'readwrite');
        buyerTx.objectStore('buyers').put(buyer);

        // Update lead
        newLeadData.deliveryStatus = 'Delivered';
        const leadUpdateTx = db.transaction('leads', 'readwrite');
        leadUpdateTx.objectStore('leads').put(newLeadData);

        // Add log
        logsStore.add({ 
            id: crypto.randomUUID(), 
            timestamp: new Date().toISOString(), 
            leadId: newLeadData.id, 
            buyerId: buyer.id, 
            status: 'Success', 
            response: 'Processed in background' 
        });

    } else {
        // Update lead
        newLeadData.deliveryStatus = 'Failed';
        const leadUpdateTx = db.transaction('leads', 'readwrite');
        leadUpdateTx.objectStore('leads').put(newLeadData);
        // Add log
         logsStore.add({ 
            id: crypto.randomUUID(), 
            timestamp: new Date().toISOString(), 
            leadId: newLeadData.id, 
            buyerId: null, 
            status: 'Failed', 
            response: 'No eligible buyers in background' 
        });
    }
}
