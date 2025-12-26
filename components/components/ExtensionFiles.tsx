import { GoogleGenAI, Type } from "@google/genai";
import { ProductDeal, GirlMathScript } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBulkGirlMathScript = async (deals: ProductDeal[]): Promise<GirlMathScript> => {
  const inputData = deals.map(d => ({
    asin: d.asin,
    title: d.title,
    price: d.price,
    code: d.code,
    discount: d.discount
  }));

  const textResponse = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: `Create TikTok script for these products: ${JSON.stringify(inputData)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          intro: { type: Type.STRING },
          outro: { type: Type.STRING },
          products: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                asin: { type: Type.STRING },
                cleanName: { type: Type.STRING },
                body: { type: Type.STRING },
                code: { type: Type.STRING }
              }
            }
          },
          masterCsvContent: { type: Type.STRING },
          masterEditingSummary: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(textResponse.text || '{}');
};
