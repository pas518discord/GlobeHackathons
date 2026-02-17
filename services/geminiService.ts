import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Hackathon, UserPreferences } from "../types.ts";

/**
 * Scout hackathons using Search Grounding (gemini-3-flash-preview)
 */
export const searchHackathons = async (
  prefs: UserPreferences, 
  onLog?: (msg: string) => void,
  targetRegion?: string
): Promise<Hackathon[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const regionName = targetRegion || prefs.currentLocation || "Global (Worldwide)";
  onLog?.(`Agent: Establishing Search Grounding link via gemini-3-flash-preview for [${regionName}]...`);

  const prompt = `
    You are an expert hackathon scout. Search the web for currently OPEN or UPCOMING hackathons.
    Focus Region: ${regionName}
    User Expertise: ${prefs.knowledgeScope.join(', ')}

    Return a JSON array of objects with:
    "name", "organizer", "is_online", "location", "latitude", "longitude",
    "start_date", "end_date", "time_period", "category", "rewards", 
    "participants_estimated", "source_url", "discoveryTier", "relevanceScore"
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        organizer: { type: Type.STRING },
        is_online: { type: Type.BOOLEAN },
        location: { type: Type.STRING },
        latitude: { type: Type.NUMBER },
        longitude: { type: Type.NUMBER },
        start_date: { type: Type.STRING },
        end_date: { type: Type.STRING },
        time_period: { type: Type.STRING },
        category: { type: Type.STRING },
        rewards: { type: Type.STRING },
        participants_estimated: { type: Type.NUMBER },
        source_url: { type: Type.STRING },
        discoveryTier: { type: Type.NUMBER },
        relevanceScore: { type: Type.NUMBER }
      },
      required: ["name", "organizer", "is_online", "location", "latitude", "longitude", "start_date", "end_date", "category", "rewards", "participants_estimated", "source_url", "discoveryTier", "relevanceScore", "time_period"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => 
      chunk.web ? { title: chunk.web.title || 'Official Registry', url: chunk.web.uri } : null
    ).filter(Boolean) as { title: string; url: string }[] || [];

    let rawText = response.text || "[]";
    let data: any[] = JSON.parse(rawText.trim());
    
    return data.map((h: any, index: number) => ({
      id: `node-${Date.now()}-${index}`,
      name: h.name,
      conductedBy: h.organizer,
      locationType: h.is_online ? 'Online' : 'Offline',
      location: h.location,
      coordinates: (h.latitude !== null && h.longitude !== null) ? { lat: h.latitude, lng: h.longitude } : undefined,
      startDate: h.start_date,
      endDate: h.end_date,
      timePeriod: h.time_period,
      category: h.category,
      prizeMoney: h.rewards,
      prizeType: h.rewards.toLowerCase().includes('$') ? 'Price' : 'Non-price',
      participantCount: h.participants_estimated || 0,
      url: h.source_url,
      relevanceScore: h.relevanceScore,
      discoveryTier: h.discoveryTier,
      sources: sources,
      status: 'UPCOMING',
      syncedAt: new Date().toISOString()
    }));
  } catch (error: any) {
    console.error("Gemini Search Grounding Error:", error);
    if (error.toString().includes('403') || error.toString().includes('PERMISSION_DENIED') || error.toString().includes('The caller does not have permission')) {
      throw error; // Re-throw to trigger auth flow in UI
    }
    onLog?.(`System_Error: Search grounding failed.`);
    return [];
  }
};

/**
 * Deep scan for location details using Maps Grounding (gemini-2.5-flash)
 */
export const deepScanLocation = async (query: string, lat?: number, lng?: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Tell me about tech hubs, venues or amenities near this location: ${query}`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
        }
      }
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const mapLinks = groundingChunks?.map((chunk: any) => 
    chunk.maps ? { title: chunk.maps.title, url: chunk.maps.uri } : null
  ).filter(Boolean) || [];

  return {
    text: response.text,
    sources: mapLinks
  };
};

/**
 * Chat interface using gemini-3-pro-preview
 */
export const createAIAgentChat = (): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'You are GlobalHackathons AI, a professional scout agent. You help developers find the best hackathons, explain tech stacks, and provide career advice. Always be concise, bold, and helpful.',
    },
  });
};

/**
 * Generate Promotional Image using gemini-3-pro-image-preview
 */
export const generateHackathonArt = async (prompt: string, aspectRatio: string = "16:9") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `High-quality futuristic promotional poster for a hackathon: ${prompt}. Cyberpunk aesthetic, bold typography, glowing tech elements.` }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: "1K"
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};