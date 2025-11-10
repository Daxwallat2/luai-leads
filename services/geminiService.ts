import { GoogleGenAI, Type } from "@google/genai";
import type { DailyLeads, LeadsBySource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ParsedAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export const parseAddressWithGemini = async (address: string): Promise<ParsedAddress> => {
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

    // The response text is a JSON string, so we parse it.
    const parsedJson = JSON.parse(response.text);
    return parsedJson as ParsedAddress;

  } catch (error) {
     console.error("Error parsing address with Gemini:", error);
     // Fallback for safety, although the structured output should be reliable.
     return { street: address, city: '', state: '', zipCode: '' };
  }
};


export const generateAnalyticsSummary = async (dailyData: DailyLeads[], sourceData: LeadsBySource[]): Promise<string> => {
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating analytics summary:", error);
    return "An error occurred while generating the AI summary. Please check the console for details.";
  }
};