import { ProductForScript } from '../types';

interface YouTubeContent {
  titles: string[];
  description: string;
  hashtags: string;
}

/**
 * Detect product category from title for hashtag generation
 */
const detectCategory = (title: string): string => {
  const lower = title.toLowerCase();
  
  if (lower.match(/makeup|lipstick|mascara|foundation|skincare|beauty|serum|moisturizer/)) {
    return '#BeautyDeals';
  }
  if (lower.match(/phone|laptop|tablet|headphone|speaker|tech|electronic|camera|gadget/)) {
    return '#TechDeals';
  }
  if (lower.match(/home|decor|furniture|bedding|pillow|blanket|lamp|rug/)) {
    return '#HomeDeals';
  }
  if (lower.match(/clothing|shirt|pants|dress|shoe|fashion|jacket|accessory/)) {
    return '#FashionDeals';
  }
  if (lower.match(/kitchen|cooking|pot|pan|utensil|appliance|blender|coffee/)) {
    return '#KitchenDeals';
  }
  
  return '#DealsAndSteals'; // Default
};

/**
 * Generate YouTube title options for a product
 */
const generateTitles = (product: ProductForScript): string[] => {
  const { cleanName, regularPrice, salePrice, discount, code } = product;
  
  const titles: string[] = [];
  
  // FORMAT 1: Price Shock
  titles.push(`$${regularPrice} → $${salePrice}?! | ${cleanName} Amazon Deal`);
  
  // FORMAT 2: Emotional Hook
  titles.push(`Stop Paying Full Price | ${cleanName} ${discount}% OFF with Code`);
  
  // FORMAT 3: Direct Value
  if (code) {
    titles.push(`${cleanName} ${discount}% OFF with Code ${code} | Amazon Deal`);
  } else {
    titles.push(`${cleanName} ${discount}% OFF | Amazon Deal`);
  }
  
  // FORMAT 4: Urgency
  titles.push(`Limited Time: ${cleanName} $${salePrice} (Was $${regularPrice}) | Code Inside`);
  
  // FORMAT 5: Cynical (On Brand for Retail Nihilist)
  titles.push(`Paying Full Price is Embarrassing | ${cleanName} Deal`);
  
  return titles;
};

/**
 * Generate complete YouTube description
 */
const generateDescription = (
  product: ProductForScript,
  siteUrl: string = 'https://retailnihilist.com'
): string => {
  const { cleanName, regularPrice, salePrice, discount, code, link } = product;
  const savings = (parseFloat(regularPrice) - parseFloat(salePrice)).toFixed(2);
  
  let description = `${cleanName} is ${discount}% off right now`;
  if (code) {
    description += ` with code ${code}`;
  }
  description += `.\n\n`;
  
  description += `👑 GET THE DEAL: ${link}\n`;
  
  if (code) {
    description += `💰 CODE: ${code} (click to copy)\n\n`;
  } else {
    description += `\n`;
  }
  
  description += `Regular Price: $${regularPrice}\n`;
  description += `Sale Price: $${salePrice}\n`;
  description += `You Save: $${savings} (${discount}%)\n\n`;
  description += `⚠️ DEAL EXPIRES: Limited time\n\n`;
  description += `---\n\n`;
  description += `📱 ALL DEALS + CODES:\n`;
  description += `👉 ${siteUrl}\n\n`;
  description += `---\n\n`;
  description += `⚠️ DISCLOSURE:\n`;
  description += `As an Amazon Associate, I earn from qualifying purchases at no extra cost to you. `;
  description += `You pay the same price whether you use my link or not. `;
  description += `I just get a small commission if you buy.\n\n`;
  description += `---\n\n`;
  
  return description;
};

/**
 * Generate hashtags based on product category
 */
const generateHashtags = (product: ProductForScript): string => {
  const categoryHashtag = detectCategory(product.cleanName);
  
  // Primary hashtags (always included)
  const primary = '#AmazonDeals #PromoCode #AmazonFinds';
  
  // Category-specific hashtag
  const hashtags = `${primary} ${categoryHashtag} #AmazonPrime`;
  
  return hashtags;
};

/**
 * Generate complete YouTube content for a product
 */
export const generateYouTubeContent = (
  product: ProductForScript,
  siteUrl?: string
): YouTubeContent => {
  return {
    titles: generateTitles(product),
    description: generateDescription(product, siteUrl),
    hashtags: generateHashtags(product)
  };
};

/**
 * Generate YouTube content for multiple products (uses first product)
 */
export const generateYouTubeContentForCampaign = (
  products: ProductForScript[],
  siteUrl?: string
): YouTubeContent | undefined => {
  if (products.length === 0) return undefined;
  
  // Use the first product as the primary focus
  const primaryProduct = products[0];
  
  const content = generateYouTubeContent(primaryProduct, siteUrl);
  
  // If multiple products, add them to description
  if (products.length > 1) {
    let additionalProducts = '\n📦 OTHER DEALS IN THIS VIDEO:\n\n';
    
    products.slice(1).forEach((product, index) => {
      additionalProducts += `${index + 2}. ${product.cleanName}\n`;
      additionalProducts += `   💰 $${product.salePrice} (was $${product.regularPrice})\n`;
      if (product.code) {
        additionalProducts += `   🏷️ Code: ${product.code}\n`;
      }
      additionalProducts += `   🔗 ${product.link}\n\n`;
    });
    
    // Insert before the disclosure section
    const descParts = content.description.split('⚠️ DISCLOSURE:');
    content.description = descParts[0] + additionalProducts + '---\n\n⚠️ DISCLOSURE:' + descParts[1];
  }
  
  return content;
};
