import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper function to safely get the API key from various environments
const getApiKey = (): string | undefined => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
      // @ts-ignore
      if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
    }
  } catch (e) {}

  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
      if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
      if (process.env.API_KEY) return process.env.API_KEY;
    }
  } catch (e) {}

  return undefined;
};

export const analyzeFoodImage = async (base64Image: string): Promise<AnalysisResult> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      "API Key is missing. If on Cloudflare, add 'VITE_API_KEY' to Settings > Environment Variables."
    );
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
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
            text: `As an expert nutritionist, analyze this food image. 
            Identify the dish and estimate its nutritional content for the serving size shown.
            
            Crucial: Estimate the Fiber, Sugar, and Water content (in grams/ml) accurately.
            Provide a "healthTip" that gives a 1-sentence scientific insight about this food (e.g., benefits for gut health, hydration, or glycemic index).

            Return a JSON object with the following structure:
            {
              "foodName": "Name of the dish",
              "description": "Short description (max 10 words)",
              "healthTip": "Expert nutritional insight (max 15 words)",
              "calories": number (estimated total calories),
              "protein": number (grams),
              "carbs": number (grams),
              "fat": number (grams),
              "fiber": number (grams),
              "sugar": number (grams),
              "water": number (grams/ml - estimate hydration value)
            }
            Ensure the values are realistic estimates.`,
          },
        ],
      },
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            description: { type: Type.STRING },
            healthTip: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            fiber: { type: Type.NUMBER },
            sugar: { type: Type.NUMBER },
            water: { type: Type.NUMBER },
          },
          required: ["foodName", "calories", "protein", "carbs", "fat", "fiber", "sugar", "water", "healthTip"],
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