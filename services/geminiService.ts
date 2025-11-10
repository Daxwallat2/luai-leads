import { GoogleGenAI, Type } from "@google/genai";
import type { DailyLeads, LeadsBySource } from '../types';

let ai: GoogleGenAI | null = null;

const getAiClient = () => {
    if (!ai) {
        // IMPORTANT: This exposes the API key to the client.
        // This is not secure for a production application.
        // The key should be handled on a server.
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY environment variable not set.");
            // In a real app, you'd want to handle this more gracefully.
            alert("API Key is not configured. AI features will not work.");
            return null;
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};


interface ParsedAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export const parseAddressWithGemini = async (address: string): Promise<ParsedAddress> => {
    const client = getAiClient();
    if (!client) {
        return { street: address, city: '', state: '', zipCode: '' }; // Fallback
    }

    const prompt = `Parse the following address into a structured JSON object with keys for "street", "city", "state", and "zipCode". The state should be the full state name. Address: "${address}"`;
    try {
        const response = await client.models.generateContent({
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
        // Fallback in case of API error
        return { street: address, city: '', state: '', zipCode: '' };
    }
};


export const generateAnalyticsSummary = async (dailyData: DailyLeads[], sourceData: LeadsBySource[]): Promise<string> => {
    const client = getAiClient();
    if (!client) {
        return "AI client is not available. Please configure the API Key.";
    }

  const prompt = `
    You are a senior marketing analyst providing a summary for a lead generation dashboard.
    Based on the following data, generate a concise, insightful summary in markdown format.
    Focus on trends, top sources, and potential areas for improvement.

    **Daily Lead Volume:**
    ${JSON.stringify(dailyData, null, 2)}

    **Leads by Source:**
    ${JSON.stringify(sourceData, null, 2)}

    Provide a summary with the following sections:
    - **Overall Performance:** A brief overview of the lead generation trend.
    - **Top Channels:** Identify the most effective lead sources.
    - **Recommendations:** Suggest actionable steps based on the data.
  `;
  
  try {
    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    return "An error occurred while generating the AI summary. Please check the console for details.";
  }
};
