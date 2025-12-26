export interface RawData {
  asin: string;
  title?: string;
  price?: string;
  code?: string;
  discount?: string;
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

export interface ProductScriptSegment {
  asin: string;
  cleanName: string;
  body: string;
  finalPriceText: string;
  promoImageUrl?: string;
  imagePrompt: string;
  code: string;
  link: string;
  regPrice: string;
  salePrice: string;
}

export interface GirlMathScript {
  intro: string;
  outro: string;
  products: ProductScriptSegment[];
  masterCsvContent: string;
  masterEditingSummary: string;
}
