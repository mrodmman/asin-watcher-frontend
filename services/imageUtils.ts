import { toPng } from 'html-to-image';

// Download any image as PNG
export const downloadImage = async (element: HTMLElement, filename: string) => {
  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2 // Higher quality
    });
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

// Copy text to clipboard
export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

// Download text as file
export const downloadTextFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

// Download CSV
export const downloadCSV = (content: string, filename: string) => {
  downloadTextFile(content, filename, 'text/csv');
};

// Color schemes for coupon codes
export const colorSchemes = [
  { name: 'Pink Dream', primary: '#FF1B8D', secondary: '#FF6B9D', emoji: '💖' },
  { name: 'Purple Vibe', primary: '#9333EA', secondary: '#C084FC', emoji: '💜' },
  { name: 'Blue Sky', primary: '#0EA5E9', secondary: '#38BDF8', emoji: '💙' },
  { name: 'Mint Fresh', primary: '#10B981', secondary: '#34D399', emoji: '🌿' },
  { name: 'Sunset', primary: '#F59E0B', secondary: '#FBBF24', emoji: '🌅' },
  { name: 'Rose Gold', primary: '#EC4899', secondary: '#F9A8D4', emoji: '✨' },
  { name: 'Ocean', primary: '#06B6D4', secondary: '#22D3EE', emoji: '🌊' },
  { name: 'Lavender', primary: '#A78BFA', secondary: '#C4B5FD', emoji: '🦄' },
];

// Get random color scheme
export const getRandomColorScheme = () => {
  return colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
};

// Get emoji for product category (simple matching)
export const getProductEmoji = (productName: string): string => {
  const name = productName.toLowerCase();
  
  if (name.includes('book') || name.includes('read')) return '📚';
  if (name.includes('toy') || name.includes('game')) return '🎮';
  if (name.includes('beauty') || name.includes('makeup')) return '💄';
  if (name.includes('food') || name.includes('snack')) return '🍕';
  if (name.includes('tech') || name.includes('electronic')) return '📱';
  if (name.includes('home') || name.includes('decor')) return '🏠';
  if (name.includes('cloth') || name.includes('fashion')) return '👗';
  if (name.includes('baby') || name.includes('kid')) return '👶';
  if (name.includes('pet') || name.includes('dog') || name.includes('cat')) return '🐾';
  if (name.includes('kitchen') || name.includes('cook')) return '🍳';
  
  return '🛍️'; // Default shopping emoji
};
