import { db } from './db.ts';
import { parseAddressWithGemini } from './services/geminiService.ts';
import type { Lead, Buyer, DeliveryLog } from './types.ts';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname.startsWith('/api/v1/webhooks/in/')) {
    event.respondWith(handleWebhook(event.request));
  }
});

async function handleWebhook(request) {
  try {
    const leadData = await request.json();
    const newLead = await processNewLeadData(leadData);
    await db.addLead(newLead);
    const log = await distributeLead(newLead);
    await db.addDeliveryLog(log);
    
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => client.postMessage({ type: 'DATA_UPDATED' }));

    return new Response(JSON.stringify({ success: true, leadId: newLead.id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

const processNewLeadData = async (leadData) => {
  let structuredAddress = { street: leadData.street || '', city: leadData.city || '', state: leadData.state || '', zipCode: leadData.zipCode || '' };
  if (leadData.address && !leadData.street) {
    structuredAddress = await parseAddressWithGemini(leadData.address);
  }
  const allLeads = await db.getLeads();
  const newLeadId = `lead-${Date.now()}-${allLeads.length}`;
  
  return {
    id: newLeadId,
    name: leadData.name || 'N/A',
    email: leadData.email || 'N/A',
    phone: leadData.phone || 'N/A',
    source: leadData.source || 'Webhook',
    status: leadData.status === 'Qualified' ? 'Qualified' : 'Not Qualified',
    deliveryStatus: 'Pending',
    date: new Date().toISOString().split('T')[0],
    street: structuredAddress.street,
    city: structuredAddress.city,
    state: structuredAddress.state,
    zipCode: structuredAddress.zipCode,
    notes: Array.isArray(leadData.notes) ? leadData.notes : (leadData.notes ? [leadData.notes] : []),
  };
};

const distributeLead = async (lead) => {
  const buyers = await db.getBuyers();
  const isLeadQualified = lead.status === 'Qualified';

  const eligibleBuyers = buyers.filter(b => 
    b.status === 'Active' &&
    b.leadsSentThisMonth < b.monthlyCap &&
    b.markets.includes(lead.state) &&
    (b.leadQualificationPreference === 'Both' || 
     (b.leadQualificationPreference === 'Qualified' && isLeadQualified) ||
     (b.leadQualificationPreference === 'Not Qualified' && !isLeadQualified))
  );

  if (eligibleBuyers.length === 0) {
    await db.putLead({ ...lead, deliveryStatus: 'Failed' });
    return {
      id: `dl-${lead.id}`, timestamp: new Date().toISOString(), leadId: lead.id,
      buyerId: 'N/A', status: 'Failed', response: 'No eligible buyers found'
    };
  }
  
  const buyer = eligibleBuyers[Math.floor(Math.random() * eligibleBuyers.length)];

  if (!buyer.webhookUrl) {
    await db.putLead({ ...lead, deliveryStatus: 'Failed' });
    return { id: `dl-${lead.id}`, timestamp: new Date().toISOString(), leadId: lead.id, buyerId: buyer.id, status: 'Failed', response: 'Buyer has no webhook URL' };
  }

  try {
    const response = await fetch(buyer.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      mode: 'no-cors' // Use 'no-cors' for webhook testing to avoid CORS issues. Response will be opaque.
    });

    const responseText = 'Opaque response due to "no-cors" mode.';
    
    // With no-cors, we can't check response.ok, so we assume success if fetch doesn't throw.
    await db.putBuyer({ ...buyer, leadsSentThisMonth: buyer.leadsSentThisMonth + 1 });
    await db.putLead({ ...lead, deliveryStatus: 'Delivered' });
    return { id: `dl-${lead.id}`, timestamp: new Date().toISOString(), leadId: lead.id, buyerId: buyer.id, status: 'Success', response: responseText };

  } catch (error) {
    await db.putLead({ ...lead, deliveryStatus: 'Failed' });
    return {
      id: `dl-${lead.id}`, timestamp: new Date().toISOString(), leadId: lead.id,
      buyerId: buyer.id, status: 'Failed', response: `Network request failed: ${error.message}`
    };
  }
};