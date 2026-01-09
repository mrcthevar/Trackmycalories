import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFoodImage = async (base64Image: string): Promise<AnalysisResult> => {
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