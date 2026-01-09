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

const commonSchema = {
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
};

export const analyzeFoodImage = async (base64Image: string): Promise<AnalysisResult> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
          {
            text: `Analyze this food image. Identify the dish and estimate nutrition.
            Crucial: Estimate Fiber, Sugar, and Water.
            Provide a "healthTip" (max 15 words).
            Return JSON.`,
          },
        ],
      },
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: commonSchema,
      },
    });

    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing food image:", error);
    throw error;
  }
};

export const analyzeNutritionLabel = async (base64Image: string): Promise<AnalysisResult> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
          {
            text: `Extract data from this Nutrition Facts label. 
            Map the values to the schema. 
            For 'foodName', identify the product name if visible, or use 'Packaged Food'.
            For 'description', say "Scanned from packaging".
            For 'healthTip', analyze the ingredients/macros and give a tip.
            If a value is missing (e.g. Water), estimate it or set to 0.`,
          },
        ],
      },
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: commonSchema,
      },
    });

    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing label:", error);
    throw error;
  }
};

export const analyzeFoodText = async (query: string): Promise<AnalysisResult> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            text: `Analyze this food description: "${query}".
            Estimate the nutritional content for the described portion.
            Crucial: Estimate Fiber, Sugar, and Water.
            Provide a "healthTip".
            Return JSON.`,
          },
        ],
      },
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: commonSchema,
      },
    });

    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing text:", error);
    throw error;
  }
};