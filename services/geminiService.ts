import type { DailyLeads, LeadsBySource } from '../types';

interface ParsedAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export const parseAddressWithGemini = async (address: string): Promise<ParsedAddress> => {
  try {
    const response = await fetch('/api/parse-address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to parse address');
    }
    const data = await response.json();
    // Match the casing from the serverless function
    return {
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode
    };
  } catch (error) {
     console.error("Error calling parse-address API:", error);
     return { street: address, city: '', state: '', zipCode: '' };
  }
};


export const generateAnalyticsSummary = async (dailyData: DailyLeads[], sourceData: LeadsBySource[]): Promise<string> => {
  try {
    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyData, sourceData }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
    }
    const { summary } = await response.json();
    return summary;
  } catch (error) {
    console.error("Error calling generate-summary API:", error);
    return "An error occurred while generating the AI summary. Please check the console for details.";
  }
};
