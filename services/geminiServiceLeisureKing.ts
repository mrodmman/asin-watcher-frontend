import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProductDeal, CampaignOutput, ProductForScript } from "../types";
import { generateYouTubeContentForCampaign } from "./youtubeContentService";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '');

// Absurdist hook combinations
const luxuryActions = [
  "sipping espresso from a gold cup",
  "eating a shrimp cocktail",
  "reading a leather-bound book",
  "getting a manicure",
  "wearing a silk sleep mask and adjusting it dramatically"
];

const chaoticEnvironments = [
  "in an active car wash",
  "at a construction site",
  "on a busy highway shoulder",
  "in an industrial freezer",
  "during a middle-school food fight"
];

// Get random absurdist scene
function getAbsurdistScene() {
  const action = luxuryActions[Math.floor(Math.random() * luxuryActions.length)];
  const environment = chaoticEnvironments[Math.floor(Math.random() * chaoticEnvironments.length)];
  return { action, environment };
}

// Helper: Convert price to TTS-friendly format (Leisure King style)
function formatPriceForTTS(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  
  const dollars = Math.floor(num);
  const cents = Math.round((num - dollars) * 100);
  
  if (num < 1) {
    return `${Math.round(num * 100)} cents`;
  } else if (cents === 0) {
    return `${dollars} dollars`;
  } else {
    // Leisure King uses more clinical language
    if (cents < 10) {
      return `under ${dollars + 1} bucks`;
    } else if (cents > 90) {
      return `under ${dollars + 1} dollars`;
    } else {
      return `${dollars} dollars and ${cents} cents`;
    }
  }
}

// Helper: Create clean product name
function createCleanName(title: string): string {
  if (!title) return "Product";
  
  const fillers = [
    /ideal gift/gi,
    /ages \d+-\d+/gi,
    /stem/gi,
    /road trip/gi,
    /educational/gi,
    /premium quality/gi,
    /best seller/gi,
    /top rated/gi,
    /\([^)]*\)/g
  ];
  
  let clean = title;
  fillers.forEach(pattern => {
    clean = clean.replace(pattern, '');
  });
  
  clean = clean.replace(/\s+/g, ' ').trim();
  
  if (clean.length > 50) {
    clean = clean.substring(0, 50).trim() + '...';
  }
  
  return clean || title.substring(0, 50);
}

// Helper: Calculate sale price from discount
function calculateSalePrice(regularPrice: string, discount: string): string {
  const reg = parseFloat(regularPrice);
  const disc = parseFloat(discount);
  
  if (isNaN(reg) || isNaN(disc)) return regularPrice;
  
  const salePrice = reg * (1 - disc / 100);
  return salePrice.toFixed(2);
}

// Process product deal into script format
function processProduct(deal: ProductDeal): ProductForScript {
  const cleanName = createCleanName(deal.title || 'Product');
  
  let regularPrice = deal.price || '0';
  let salePrice = deal.price || '0';
  
  if (deal.discount) {
    const discountNum = parseFloat(deal.discount);
    if (!isNaN(discountNum)) {
      salePrice = calculateSalePrice(regularPrice, deal.discount);
    }
  }
  
  return {
    asin: deal.asin,
    cleanName,
    regularPrice,
    salePrice,
    code: deal.code || 'None shown',
    discount: deal.discount || '0',
    imageUrl: deal.imageUrl || '',
    link: deal.affiliateLink || `https://www.amazon.com/dp/${deal.asin}`,
    wittyLine: ''
  };
}

export const generateLeisureKingCampaign = async (deals: ProductDeal[]): Promise<CampaignOutput> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  const products = deals.map(processProduct);
  
  // Get random absurdist scene for AI video
  const scene = getAbsurdistScene();
  
  // Build the opening line with the scene
  const openingLine = `I'm not mad you're broke, I'm just disappointed you're paying full price. I'm ${scene.action} ${scene.environment} so you don't have to. Pay attention.`;
  const closingLine = `Link in bio with codes and products on Amazon. Go spend your feelings. I'm busy.`;
  
  // Build AI video prompt with dialogue
  const aiVideoPrompt = `Cinematic 9:16 vertical video. A man in his 30s with messy hair wearing a silk bathrobe and oversized clear-frame glasses is ${scene.action} while ${scene.environment}. He is looking directly at the camera with a deadpan, disappointed Ryan Reynolds smirk. Shaky handheld camera footage, 4k, hyper-realistic, moody cinematic lighting.

OPENING DIALOGUE (Character speaks to camera):
"${openingLine}"

CLOSING DIALOGUE (Character speaks to camera):
"${closingLine}"

Seed: 576995276

Note: Generate two separate clips - one for opening (5-7 seconds) and one for closing (3-5 seconds). Character maintains disappointed, cynical expression throughout.`;

  // Build prompt for Gemini (Leisure King style)
  const prompt = `You are a product-analysis assistant creating cynical, witty video scripts for "The Leisure King" persona.

Voice: Cynical, authoritative, disappointed. Think "Ryan Reynolds as a disappointed parent."
Tone: Economic Delusion (framing savings as profit) and Retail Nihilism (nothing matters but this discount).

I have ${products.length} products. For EACH product, generate a witty line following these STRICT rules:

LEISURE KING WITTY LINE FORMULA:
1. Use Economic Delusion framing: "You're essentially getting paid X dollars to buy this"
2. OR Retail Nihilism: "That's not a purchase, it's a salary" 
3. MUST use prices in TTS format (see below)
4. Use cynical language: "essentially," "literally," "offensive," "unacceptable"
5. AVOID: "just", "only", cheerful language
6. If code exists, reference it generically: "with the code" not the actual code name

TTS-FRIENDLY PRICE RULES:
- Whole dollars: "X dollars" (e.g., $12 = "12 dollars")
- Under $1: "X cents" 
- With cents: "under X bucks" or "X dollars and Y cents"
- Savings: "essentially getting paid 20 dollars"

PRODUCTS:
${products.map((p, i) => `
${i + 1}. ${p.cleanName}
   Regular: $${p.regularPrice}
   Sale: $${p.salePrice}
   Has Code: ${p.code !== 'None shown' ? 'Yes' : 'No'}
   Discount: ${p.discount}%
`).join('\n')}

Return ONLY a JSON object:
{
  "products": [
    {
      "asin": "...",
      "wittyLine": "Your Leisure King witty line here"
    }
  ]
}

Remember: Cynical, clinical, economic delusion. Make it sound like paying full price is offensive.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    
    const aiResponse = JSON.parse(jsonText);
    
    aiResponse.products.forEach((aiProduct: any, index: number) => {
      if (products[index]) {
        products[index].wittyLine = aiProduct.wittyLine;
      }
    });
    
  } catch (error) {
    console.error('AI generation failed, using fallback witty lines:', error);
    products.forEach(p => {
      const savings = (parseFloat(p.regularPrice) - parseFloat(p.salePrice)).toFixed(2);
      const hasCode = p.code !== 'None shown';
      
      p.wittyLine = hasCode 
        ? `You're essentially getting paid ${savings} dollars to buy this with the code. That's not a purchase, it's a salary.`
        : `For ${formatPriceForTTS(p.salePrice)}? That's offensive. I'm buying three.`;
    });
  }
  
  // Build video script (Leisure King style)
  const intro = openingLine;
  
  const productLines = products.map(p => 
    `This is the ${p.cleanName}. ${p.wittyLine}`
  ).join('\n\n<#0.5#>\n\n');
  
  const outro = closingLine;
  
  const videoScript = `${intro}\n\n${productLines}\n\n${outro}`;
  
  // Build editing summary
  const editingSummary = products.map(p => 
    `${p.cleanName} | ${p.code}`
  ).join('\n');
  
  // Build CSV
  const csvHeader = 'Title,Link,RegularPrice,SalePrice,Code';
  const csvRows = products.map(p => 
    `"${p.cleanName}","${p.link}",${p.regularPrice},${p.salePrice},"${p.code}"`
  );
  const csvContent = `${csvHeader}\n${csvRows.join('\n')}`;
  
  // Generate YouTube content
  const youtubeContent = generateYouTubeContentForCampaign(products);

  return {
    persona: 'leisureking',
    aiVideoPrompt,
    videoScript,
    editingSummary,
    csvContent,
    products,
    youtubeContent
  };
};
