import { GoogleGenAI } from "@google/genai";
import type { NewsUpdate, GroundingSource } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function fetchLatestNews(topic: string): Promise<NewsUpdate | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a concise, single-paragraph summary of the absolute latest news or breaking event about "${topic}". Focus only on the most recent development within the last few hours.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summary = response.text.trim();
    if (!summary) {
      return null;
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] = [];

    if (groundingChunks) {
      for (const chunk of groundingChunks) {
        if (chunk.web) {
          sources.push({
            uri: chunk.web.uri || '#',
            title: chunk.web.title || chunk.web.uri || 'Untitled Source',
          });
        }
      }
    }
    
    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map(item => [item['uri'], item])).values());

    return { summary, sources: uniqueSources };
  } catch (error) {
    console.error("Error fetching latest news:", error);
    throw new Error("Failed to fetch news from Gemini API.");
  }
}

export async function generateTweet(summary: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following news summary, write a compelling and concise tweet. The tweet must be under 280 characters and include 2-3 relevant hashtags.
      
      News Summary: "${summary}"`,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating tweet:", error);
    throw new Error("Failed to generate tweet from Gemini API.");
  }
}
