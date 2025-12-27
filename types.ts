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

export interface CampaignOutput {
  videoScript: string;
  editingSummary: string;
  csvContent: string;
  products: ProductForScript[];
}

export interface CouponImageStyle {
  type: 'gradient' | 'solid' | 'minimal';
  primaryColor: string;
  secondaryColor?: string;
  emoji: string;
  showProductName: boolean;
  showDiscount: boolean;
}
