
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize with named parameter and direct access to process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface BusinessInsight {
  title: string;
  description: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AdStrategy {
  winner: string;
  reasoning: string;
  tacticalAdvice: string[];
  scalingPotential: 'high' | 'medium' | 'low';
}

export const getBusinessInsights = async (data: any): Promise<BusinessInsight[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following business data and provide 3 actionable insights in JSON format: ${JSON.stringify(data)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              impact: { 
                type: Type.STRING,
                description: "The expected business impact level: 'high', 'medium', or 'low'."
              },
            },
            required: ['title', 'description', 'recommendation', 'impact'],
          },
        },
      },
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return [];
  }
};

export const getMarketingStrategy = async (campaigns: any[]): Promise<AdStrategy | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a world-class ad strategist. Analyze these campaigns and pick the "Winning" one. Provide tactical advice on what to do next. Data: ${JSON.stringify(campaigns)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            winner: { type: Type.STRING, description: "Name of the winning campaign" },
            reasoning: { type: Type.STRING, description: "Why it is performing better than others" },
            tacticalAdvice: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-4 specific tactical steps to take"
            },
            scalingPotential: { type: Type.STRING, description: "Scale: 'high', 'medium', or 'low'" }
          },
          required: ['winner', 'reasoning', 'tacticalAdvice', 'scalingPotential'],
        },
      },
    });

    return JSON.parse(response.text || 'null');
  } catch (error) {
    console.error("Gemini Strategy Error:", error);
    return null;
  }
};
