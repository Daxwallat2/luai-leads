import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface ParsedAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

const parseAddressWithGemini = async (address: string): Promise<ParsedAddress> => {
    const prompt = `Parse the following address into a structured JSON object with keys for "street", "city", "state", and "zipCode". The state should be the full state name. Address: "${address}"`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        street: { type: Type.STRING },
                        city: { type: Type.STRING },
                        state: { type: Type.STRING },
                        zipCode: { type: Type.STRING },
                    },
                    required: ['street', 'city', 'state', 'zipCode'],
                },
            },
        });
        return JSON.parse(response.text) as ParsedAddress;
    } catch (error) {
        console.error("Error parsing address with Gemini:", error);
        return { street: address, city: '', state: '', zipCode: '' };
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const leadData = req.body;

        // 1. Process and enrich lead data
        let structuredAddress = { street: leadData.street || '', city: leadData.city || '', state: leadData.state || '', zip_code: leadData.zipCode || '' };
        if (leadData.address && !leadData.street) {
            const parsed = await parseAddressWithGemini(leadData.address);
            structuredAddress = { street: parsed.street, city: parsed.city, state: parsed.state, zip_code: parsed.zipCode };
        }
        
        const leadToInsert = {
            name: leadData.name || 'N/A',
            email: leadData.email || 'N/A',
            phone: leadData.phone || 'N/A',
            source: leadData.source || 'Webhook',
            status: leadData.status === 'Qualified' ? 'Qualified' : 'Not Qualified',
            delivery_status: 'Pending',
            notes: Array.isArray(leadData.notes) ? leadData.notes : (leadData.notes ? [leadData.notes] : []),
            ...structuredAddress
        };

        const { data: newLead, error: leadError } = await supabase
            .from('leads')
            .insert(leadToInsert)
            .select()
            .single();

        if (leadError) throw new Error(`Supabase lead insert error: ${leadError.message}`);
        if (!newLead) throw new Error('Failed to create new lead.');
        
        // 2. Distribute the lead
        const isLeadQualified = newLead.status === 'Qualified';
        const { data: buyers, error: buyerError } = await supabase
            .from('buyers')
            .select('*')
            .eq('status', 'Active')
            .lt('leads_sent_this_month', supabase.raw('monthly_cap'))
            .contains('markets', [newLead.state]);

        if (buyerError) throw new Error(`Supabase buyer fetch error: ${buyerError.message}`);

        const eligibleBuyers = buyers?.filter(b => 
            b.lead_qualification_preference === 'Both' ||
            (b.lead_qualification_preference === 'Qualified' && isLeadQualified) ||
            (b.lead_qualification_preference === 'Not Qualified' && !isLeadQualified)
        ) || [];

        let logData;

        if (eligibleBuyers.length === 0) {
            await supabase.from('leads').update({ delivery_status: 'Failed' }).eq('id', newLead.id);
            logData = { lead_id: newLead.id, buyer_id: null, status: 'Failed', response: 'No eligible buyers found' };
        } else {
            const buyer = eligibleBuyers[Math.floor(Math.random() * eligibleBuyers.length)];
            
            if (!buyer.webhook_url) {
                await supabase.from('leads').update({ delivery_status: 'Failed' }).eq('id', newLead.id);
                logData = { lead_id: newLead.id, buyer_id: buyer.id, status: 'Failed', response: 'Buyer has no webhook URL' };
            } else {
                try {
                    // We don't await this because we don't want to hold up the response.
                    // In a production system, this would be handled by a queue.
                    fetch(buyer.webhook_url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newLead)
                    }).catch(e => console.error(`Webhook delivery failed for buyer ${buyer.id}:`, e));
                    
                    // Assume success for now. A more robust system would get a callback.
                    await supabase.from('leads').update({ delivery_status: 'Delivered' }).eq('id', newLead.id);
                    await supabase.rpc('increment_buyer_leads_sent', { buyer_id_param: buyer.id });
                    
                    logData = { lead_id: newLead.id, buyer_id: buyer.id, status: 'Success', response: 'Sent to buyer webhook.' };
                } catch (deliveryError: any) {
                    await supabase.from('leads').update({ delivery_status: 'Failed' }).eq('id', newLead.id);
                    logData = { lead_id: newLead.id, buyer_id: buyer.id, status: 'Failed', response: `Delivery error: ${deliveryError.message}` };
                }
            }
        }

        const { error: logError } = await supabase.from('delivery_logs').insert(logData);
        if (logError) console.error('Supabase log insert error:', logError.message);

        return res.status(200).json({ success: true, leadId: newLead.id });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}