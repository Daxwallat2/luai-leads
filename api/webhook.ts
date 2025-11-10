import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { parseAddressWithGemini } from '../services/geminiService';
import type { Lead, Buyer, DeliveryLog } from '../types';

const processNewLeadData = async (leadData: any): Promise<Omit<Lead, 'id' | 'deliveryStatus' | 'date'>> => {
  let structuredAddress = { 
    street: leadData.street || '', 
    city: leadData.city || '', 
    state: leadData.state || '', 
    zipCode: leadData.zipCode || '' 
  };
  
  if (leadData.address && !leadData.street) {
    structuredAddress = await parseAddressWithGemini(leadData.address);
  }
  
  return {
    name: leadData.name || 'N/A',
    email: leadData.email || 'N/A',
    phone: leadData.phone || 'N/A',
    source: leadData.source || 'Webhook',
    status: leadData.status === 'Qualified' ? 'Qualified' : 'Not Qualified',
    street: structuredAddress.street,
    city: structuredAddress.city,
    state: structuredAddress.state,
    zipCode: structuredAddress.zipCode,
    notes: Array.isArray(leadData.notes) ? leadData.notes : (leadData.notes ? [leadData.notes] : []),
  };
};

const distributeLead = async (lead: Lead): Promise<DeliveryLog> => {
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
    await db.updateLeadDeliveryStatus(lead.id, 'Failed');
    return db.addDeliveryLog({
      leadId: lead.id,
      buyerId: 'N/A', status: 'Failed', response: 'No eligible buyers found'
    });
  }
  
  const buyer = eligibleBuyers[Math.floor(Math.random() * eligibleBuyers.length)];

  if (!buyer.webhookUrl) {
    await db.updateLeadDeliveryStatus(lead.id, 'Failed');
    return db.addDeliveryLog({ 
      leadId: lead.id, buyerId: buyer.id, status: 'Failed', response: 'Buyer has no webhook URL' 
    });
  }

  try {
    // In a real scenario, you'd use a library like 'node-fetch'.
    // The environment should support fetch.
    const response = await fetch(buyer.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });

    const responseText = await response.text();
    if (!response.ok) throw new Error(`Webhook failed with status ${response.status}: ${responseText}`);
    
    await db.incrementBuyerLeadCount(buyer.id);
    await db.updateLeadDeliveryStatus(lead.id, 'Delivered');
    return db.addDeliveryLog({ 
      leadId: lead.id, buyerId: buyer.id, status: 'Success', response: responseText 
    });

  } catch (error: any) {
    await db.updateLeadDeliveryStatus(lead.id, 'Failed');
    return db.addDeliveryLog({
      leadId: lead.id,
      buyerId: buyer.id, status: 'Failed', response: `Network request failed: ${error.message}`
    });
  }
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const leadData = await processNewLeadData(req.body);
    const newLead = await db.addLead(leadData);
    
    await distributeLead(newLead);

    return res.status(200).json({ success: true, leadId: newLead.id });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}