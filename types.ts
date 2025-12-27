export interface RawData {
  asin: string;
  title?: string;
  price?: string;
  code?: string;
  discount?: string;
  imageUrl?: string;
}

export interface ProductDeal {
  asin: string;
  title?: string;
  price?: string;
  code?: string;
  discount?: string;
  status: 'Ready' | 'Incomplete';
  imageUrl?: string;
  lastUpdated: number;
}

export interface ProductForScript {
  asin: string;
  cleanName: string;
  regularPrice: string;
  salePrice: string;
  code: string;
  discount: string;
  imageUrl: string;
  link: string;
  wittyLine: string;
}

export type Persona = 'girlmath' | 'leisureking';

export interface CampaignOutput {
  persona: Persona;
  aiVideoPrompt?: string; // Only for Leisure King
  videoScript: string;
  editingSummary: string;
  csvContent: string;
  products: ProductForScript[];
  youtubeContent?: {
    titles: string[]; // 5 title options
    description: string; // Full description ready to paste
    hashtags: string; // Category-specific hashtags
  };
}

export interface CouponImageStyle {
  type: 'gradient' | 'solid' | 'minimal' | 'brutalist';
  primaryColor: string;
  secondaryColor?: string;
  emoji: string;
  showProductName: boolean;
  showDiscount: boolean;
}
