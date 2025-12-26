import React from 'react';
import { ProductDeal } from '../types';

interface ProductCardProps {
  deal: ProductDeal;
  isSelected: boolean;
  onSelect: (asin: string) => void;
  onGenerateSingle: (asin: string) => void;
  isGenerating: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ deal, isSelected, onSelect, onGenerateSingle, isGenerating }) => {
  const isReady = deal.status === 'Ready';

  return (
    <div className={`bg-white rounded-2xl border ${isSelected ? 'border-pink-500 ring-2 ring-pink-200' : 'border-pink-100'} overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative`}>
      {isReady && (
        <button onClick={() => onSelect(deal.asin)} className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white/80 border-pink-200'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      )}
      <div className="relative aspect-square overflow-hidden bg-pink-50">
        <img src={deal.imageUrl} alt={deal.title || 'Product'} className="w-full h-full object-cover"/>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${isReady ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{deal.status}</span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/80 text-gray-500">{deal.asin}</span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[40px]">
          {deal.title || <span className="text-gray-300 italic">Waiting...</span>}
        </h3>
        <div className="space-y-1.5 mb-4 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">Price:</span><span className="font-bold">{deal.price ? `$${deal.price}` : '--'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Code:</span><span className="font-bold text-pink-600">{deal.code || '--'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Discount:</span><span className="font-bold text-pink-600">{deal.discount ? `${deal.discount}%` : '--'}</span></div>
        </div>
        <button onClick={() => onGenerateSingle(deal.asin)} disabled={!isReady || isGenerating} className={`w-full py-2.5 rounded-xl font-bold text-sm ${isReady ? 'bg-pink-50 text-pink-600 hover:bg-pink-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
          Generate Single
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
