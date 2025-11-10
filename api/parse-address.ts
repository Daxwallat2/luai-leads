import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { address } = req.body;
    if (!address) {
        return res.status(400).json({ error: 'Address is required' });
    }
    
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
                        street: { type: Type.STRING, description: 'The street address, including number and street name.' },
                        city: { type: Type.STRING, description: 'The city name.' },
                        state: { type: Type.STRING, description: 'The full state name (e.g., "California", not "CA").' },
                        zipCode: { type: Type.STRING, description: 'The 5-digit ZIP code.' },
                    },
                    required: ['street', 'city', 'state', 'zipCode'],
                },
            },
        });

        const parsedJson = JSON.parse(response.text);
        return res.status(200).json(parsedJson);

    } catch (error) {
        console.error("Error parsing address with Gemini:", error);
        return res.status(500).json({ error: 'Failed to parse address using AI' });
    }
}
