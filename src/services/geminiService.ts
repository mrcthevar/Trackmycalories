import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const FOOD_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Common name of the Indian food item" },
          portion: { type: Type.STRING, description: "Estimated portion size (e.g., 1 bowl, 2 roti)" },
          calories: { type: Type.NUMBER, description: "Estimated calories" },
          protein: { type: Type.NUMBER, description: "Estimated protein in grams" },
          carbs: { type: Type.NUMBER, description: "Estimated carbs in grams" },
          fats: { type: Type.NUMBER, description: "Estimated fats in grams" },
        },
        required: ["name", "portion", "calories", "protein", "carbs", "fats"],
      },
    },
  },
  required: ["items"],
};

export async function analyzeFoodImage(base64Image: string): Promise<FoodItem[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Analyze this image of Indian food. Detect all food items and estimate their calories and macronutrients (protein, carbs, fats) based on the portion sizes visible. Return a list of items." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1] || base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: FOOD_ANALYSIS_SCHEMA,
      },
    });

    const result = JSON.parse(response.text || '{"items": []}');
    return result.items.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
    }));
  } catch (error) {
    console.error("Error analyzing food image:", error);
    throw error;
  }
}
