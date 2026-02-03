import { GoogleGenAI, Type } from "@google/genai";
import { Hackathon, UserPreferences } from "../types";

/**
 * INTERNAL CONFIGURATION
 * Add your keys here for "behind the code" storage.
 */
const COMET_API_KEY = "YOUR_INTERNAL_COMET_KEY_HERE"; 

/**
 * Searches for hackathons using Gemini 3 Pro with Google Search Grounding.
 * The API key is injected via environment variables at runtime.
 */
export const searchHackathons = async (
  prefs: UserPreferences, 
  onLog?: (msg: string) => void
): Promise<Hackathon[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const locationContext = prefs.currentLocation.trim() 
    ? `Target Location Bias: ${prefs.currentLocation}`
    : `Target Scope: Global (Worldwide discovery, no specific city bias)`;

  onLog?.(`Agent: Initiating Global Hackathon Discovery...`);
  onLog?.(`Parameters: ${prefs.knowledgeScope.join(', ')} | ${prefs.preferredCategories.join(', ')}`);

  const prompt = `
    Conduct a deep search for current and upcoming hackathons. 
    Use Google Search Grounding to find verified, real-world data from platforms like Devpost, Devfolio, HackerEarth, and corporate innovation pages.
    
    User Profile:
    - Tech Stack: ${prefs.knowledgeScope.join(', ')}
    - Interest Categories: ${prefs.preferredCategories.join(', ')}
    - ${locationContext}

    MANDATORY SPECIFICATIONS for each result:
    - name: Official hackathon name.
    - conductedBy: Organizing company or community (e.g., 'Google Cloud', 'Meta', 'EthGlobal').
    - location: Specific city/country or 'Online/Remote'.
    - locationType: Exactly 'Online', 'Offline', or 'Hybrid'.
    - timePeriod: Readable string (e.g., 'March 16 - April 25, 2025').
    - startDate/endDate: Valid ISO 8601 date strings.
    - prizeMoney: Amount (e.g. '$100,000') or specific reward description (e.g. 'Paid Internship + Swag').
    - prizeType: Exactly 'Price' (for cash) or 'Non-price' (for non-monetary rewards).
    - category: Vertical (from: ${prefs.preferredCategories.join(', ') || 'Web Dev, AI, ML, Blockchain'}).
    - participantCount: Approximate or actual number of people currently applied/registered (integer).
    - coordinates: Estimated Lat/Lng for map visualization.
    - relevanceScore: 0-100 based on fit for: ${prefs.knowledgeScope.join(', ')}.
    
    Return only valid JSON matching the provided schema.
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        locationType: { type: Type.STRING },
        location: { type: Type.STRING },
        coordinates: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER }
          },
          required: ["lat", "lng"]
        },
        timePeriod: { type: Type.STRING },
        startDate: { type: Type.STRING },
        endDate: { type: Type.STRING },
        conductedBy: { type: Type.STRING },
        prizeMoney: { type: Type.STRING },
        prizeType: { type: Type.STRING },
        category: { type: Type.STRING },
        participantCount: { type: Type.NUMBER },
        url: { type: Type.STRING },
        relevanceScore: { type: Type.NUMBER }
      },
      required: [
        "name", "locationType", "location", "startDate", "endDate", 
        "conductedBy", "prizeMoney", "prizeType", "category", 
        "participantCount", "url", "relevanceScore", "coordinates", "timePeriod"
      ]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    onLog?.("Agent: Grounding successful. Syncing telemetry...");
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        url: chunk.web.uri
      }));

    const text = response.text || "[]";
    const data = JSON.parse(text.trim());
    
    return data.map((h: any, index: number) => ({
      ...h,
      id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
      sources: sources
    }));
  } catch (error) {
    onLog?.(`System Error: Search grounding failed.`);
    console.error(error);
    return [];
  }
};