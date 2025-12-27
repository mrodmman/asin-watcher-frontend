import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProductDeal, CampaignOutput, ProductForScript } from "../types";
import { generateYouTubeContentForCampaign } from "./youtubeContentService";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '');

// Absurdist hook combinations - EXPANDED
const luxuryActions = [
  "sipping espresso from a gold cup",
  "eating a shrimp cocktail",
  "reading a leather-bound book",
  "getting a manicure",
  "wearing a silk sleep mask and adjusting it dramatically",
  "polishing a Rolex I can't afford",
  "eating caviar directly from the tin",
  "smoking a cigar that costs more than your rent",
  "wearing noise-canceling headphones blasting Mozart",
  "applying hand cream that costs 80 dollars an ounce",
  "drinking champagne from a crystal flute",
  "wearing sunglasses even though it's dark",
  "getting my shoes shined by an invisible servant",
  "adjusting a monocle I don't need",
  "filing my nails with a diamond file",
  "eating grapes one at a time like a Roman emperor",
  "wearing a silk scarf that's worth more than your car",
  "holding a martini glass filled with sparkling water",
  "reading poetry I don't understand but pretend to",
  "wearing velvet slippers indoors"
];

const chaoticEnvironments = [
  "in an active car wash",
  "at a construction site",
  "on a busy highway shoulder",
  "in an industrial freezer",
  "during a middle-school food fight",
  "in the frozen foods aisle at Walmart",
  "at a gas station pump at 2am",
  "in a public restroom that hasn't been cleaned in weeks",
  "at a DMV waiting area",
  "in the parking lot of a Spirit Halloween in February",
  "at a Little League game I'm not invited to",
  "in the back of an Uber that smells like regret",
  "at a laundromat while someone else's clothes are spinning",
  "in a Planet Fitness locker room",
  "at a public library during toddler storytime",
  "in the returns line at Target on December 26th",
  "at a bus stop in the rain",
  "in a Chuck E. Cheese ball pit",
  "at a self-checkout that keeps saying unexpected item",
  "in the waiting room of a tire shop"
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
    /new arrival/gi,
    /limited edition/gi,
    /exclusive/gi,
    /upgraded/gi,
    /improved/gi,
    /amazon's choice/gi,
    /highly rated/gi,
    /\([^)]*\)/g,  // Remove anything in parentheses
    /\[[^\]]*\]/g,  // Remove anything in brackets
    /,\s*\d+\s*pack/gi,  // Remove ", 2 Pack" etc at end
    /,\s*set of \d+/gi,  // Remove ", Set of 2" etc
  ];
  
  let clean = title;
  fillers.forEach(pattern => {
    clean = clean.replace(pattern, '');
  });
  
  // Clean up extra spaces and dashes
  clean = clean.replace(/\s+/g, ' ').trim();
  clean = clean.replace(/\s*-\s*/g, ' ').trim();  // Replace dashes with spaces
  
  // Only truncate if REALLY long (80+ chars), and try to break at a word
  if (clean.length > 80) {
    const truncated = clean.substring(0, 80);
    const lastSpace = truncated.lastIndexOf(' ');
    clean = (lastSpace > 60 ? truncated.substring(0, lastSpace) : truncated).trim();
  }
  
  return clean || title.substring(0, 80);
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

  // Build prompt for Gemini (Leisure King style - Ryan Reynolds smartass energy)
  const prompt = `You are "The Leisure King" - think Ryan Reynolds if he did TikTok shopping videos while drunk on cynicism.

YOUR PERSONALITY:
- Smartass who's too clever for his own good
- Self-aware that this is absurd but leans into it
- Slightly inappropriate but never crosses the line
- Makes uncomfortable eye contact with the camera
- Treats shopping like a performance art piece
- Low-key roasting both the product AND the viewer

YOUR VOICE:
Think Ryan Reynolds in Deadpool meets a disappointed life coach meets someone who just realized capitalism is a joke.
You're not angry - you're just... concerned about people's financial choices.

I have ${products.length} products. For EACH product, write ONE LINE that's:
- WITTY and UNEXPECTED (surprise me)
- SLIGHTLY EDGY (push boundaries a little)
- CYNICALLY HILARIOUS (make me laugh-cry)
- COMPLETELY DIFFERENT from the other products (no repeating yourself)

CREATIVE FREEDOM:
- Use whatever angle makes YOU laugh
- Be self-aware and meta if you want
- Reference the absurdity of the situation
- Make fun of the product, the price, the viewer, yourself - whatever lands
- Think "what would Ryan Reynolds say if he was selling this at 2am while questioning his life choices"

VARIETY ENFORCEMENT:
Each product needs a DIFFERENT comedic angle. If you catch yourself repeating a structure, STOP and try something completely different.

Examples of GOOD variety:
Product 1: "You're essentially getting paid 27 dollars to buy this. That's not shopping, it's employment."
Product 2: "Let me get this straight. You can pay 30 dollars... or you can pay 7 dollars with a code. Are you okay? Blink twice if you need help."
Product 3: "I bought three of these just to feel alive. It's 15 bucks with the code. Don't @ me."

FORBIDDEN:
- Being boring
- Repeating the same joke structure
- Using "just" or "only" (it's basic)
- Being cheerful (we're cynical here)

ENCOURAGED:
- Being weird
- Self-aware commentary
- Meta humor
- Slightly uncomfortable observations
- Economic absurdism
- Existential product analysis

TTS-FRIENDLY PRICES:
- Say "X dollars" not "$X"
- Say "under X bucks" for prices with cents
- Say "X dollars and Y cents" if specific

PRODUCTS:
${products.map((p, i) => `
${i + 1}. ${p.cleanName}
   Regular: $${p.regularPrice}
   Sale: $${p.salePrice}
   Code: ${p.code !== 'None shown' ? 'Yes' : 'No'}
   Discount: ${p.discount}%
   Your task: Make me laugh with ONE UNIQUE LINE about this
`).join('\n')}

Return ONLY a JSON object:
{
  "products": [
    {
      "asin": "...",
      "wittyLine": "Your Ryan Reynolds smartass line here - be creative and DIFFERENT for each"
    }
  ]
}

Remember: You're Ryan Reynolds selling discount hampers at 3am. Be weird. Be funny. Don't repeat yourself. Make it uncomfortable in the best way.`;

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
  
  // FAILSAFE: Detect and fix repetition
  const wittyLines = products.map(p => p.wittyLine);
  const hasRepetition = wittyLines.some((line, i) => 
    wittyLines.findIndex(l => l.includes('essentially getting paid') && l.includes('salary')) !== -1 &&
    wittyLines.filter(l => l.includes('essentially getting paid') && l.includes('salary')).length > 1
  );
  
  if (hasRepetition) {
    console.warn('DETECTED REPETITION - Applying manual variety enforcement');
    
    // Manually assign different frameworks
    const frameworks = [
      (p: ProductForScript) => {
        const savings = (parseFloat(p.regularPrice) - parseFloat(p.salePrice)).toFixed(2);
        return `You're essentially getting paid ${savings} dollars to buy this. That's employment.`;
      },
      (p: ProductForScript) => {
        return `The math here is offensive. ${p.salePrice} dollars for something worth ${p.regularPrice}.`;
      },
      (p: ProductForScript) => {
        return `We need to talk about why you'd pay ${p.regularPrice} when it's ${p.salePrice} with the code.`;
      },
      (p: ProductForScript) => {
        return `Paying full price for this? That's embarrassing for you. Code makes it ${p.salePrice} bucks.`;
      },
      (p: ProductForScript) => {
        return `Full price is clinical insanity. ${p.salePrice} dollars with the code or you're doing it wrong.`;
      }
    ];
    
    products.forEach((p, i) => {
      p.wittyLine = frameworks[i % frameworks.length](p);
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
