import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { dailyData, sourceData } = req.body;

    if (!dailyData || !sourceData) {
        return res.status(400).json({ error: 'Daily and source data are required' });
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
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return res.status(200).json({ summary: response.text });
    } catch (error) {
        console.error("Error generating analytics summary:", error);
        return res.status(500).json({ error: 'Failed to generate summary using AI' });
    }
}
