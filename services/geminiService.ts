import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper function to safely get the API key from various environments
const getApiKey = (): string | undefined => {
  // 1. Check Vite (import.meta.env) - Common in modern React
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
      // @ts-ignore
      if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
    }
  } catch (e) {
    // Ignore errors if import.meta is not supported
  }

  // 2. Check process.env - Common in CRA / Webpack / Node
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
      if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
      if (process.env.API_KEY) return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore errors if process is not defined
  }

  return undefined;
};

export const analyzeFoodImage = async (base64Image: string): Promise<AnalysisResult> => {
  const apiKey = getApiKey();

  // Check for API key availability
  if (!apiKey) {
    throw new Error(
      "API Key is missing. If on Cloudflare, add 'VITE_API_KEY' to Settings > Environment Variables."
    );
  }

  // Initialize client lazily with the retrieved key
  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    // Strip the data URL prefix if present to get just the base64 string
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg", 
            },
          },
          {
            text: `Analyze this food image. Identify the dish and estimate its nutritional content for the serving size shown.
            Return a JSON object with the following structure:
            {
              "foodName": "Name of the dish",
              "description": "Short description (max 10 words)",
              "calories": number (estimated total calories),
              "protein": number (grams),
              "carbs": number (grams),
              "fat": number (grams)
            }
            Ensure the values are realistic estimates.`,
          },
        ],
      },
      config: {
        temperature: 0.1, // Low temperature for deterministic results
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            description: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
          },
          required: ["foodName", "calories", "protein", "carbs", "fat"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing food:", error);
    throw error;
  }
};