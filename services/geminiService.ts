import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProductDeal, GirlMathScript } from "../types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '');

export const generateBulkGirlMathScript = async (deals: ProductDeal[]): Promise<GirlMathScript> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  const inputData = deals.map(d => ({
    asin: d.asin,
    title: d.title,
    price: d.price,
    code: d.code,
    discount: d.discount
  }));

  const prompt = `Create a TikTok script for these Amazon products: ${JSON.stringify(inputData, null, 2)}
  
  Return JSON with this structure:
  {
    "intro": "Opening hook for the video",
    "outro": "Closing statement",
    "products": [
      {
        "asin": "product ASIN",
        "cleanName": "Short product name",
        "body": "Script text for this product",
        "code": "Promo code if available"
      }
    ],
    "masterCsvContent": "CSV formatted data",
    "masterEditingSummary": "Editing notes"
  }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
  const jsonText = jsonMatch ? jsonMatch[1] : text;
  
  return JSON.parse(jsonText);
};
