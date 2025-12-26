import React, { useState } from 'react';
import { ProductDeal, RawData, GirlMathScript } from '../types';
import ProductCard from './ProductCard';
import ScriptView from './ScriptView';
import { generateBulkGirlMathScript } from '../services/geminiService';

interface DashboardProps {
  deals: ProductDeal[];
  onIngest: (data: RawData) => void;
  onClear: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ deals, onIngest, onClear }) => {
  const [selectedAsins, setSelectedAsins] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGeneration, setActiveGeneration] = useState<GirlMathScript | null>(null);

  const toggleSelect = (asin: string) => {
    setSelectedAsins(prev => 
      prev.includes(asin) ? prev.filter(a => a !== asin) : [...prev, asin]
    );
  };

  const handleBulkGenerate = async () => {
    const selectedDeals = deals.filter(d => selectedAsins.includes(d.asin) && d.status === 'Ready');
    if (selectedDeals.length === 0) return;
    setIsGenerating(true);
    try {
      const script = await generateBulkGirlMathScript(selectedDeals);
      setActiveGeneration(script);
      setSelectedAsins([]); 
    } catch (err) {
      alert("Failed to generate campaign.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSingle = async (asin: string) => {
    const deal = deals.find(d => d.asin === asin);
    if (!deal) return;
    setIsGenerating(true);
    try {
      const script = await generateBulkGirlMathScript([deal]);
      setActiveGeneration(script);
    } catch (err) {
      alert("Failed to generate script.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Deal Hub</h2>
        <p className="text-sm text-gray-500">{deals.length} watches. {selectedAsins.length} selected.</p>
        <button onClick={onClear} className="mt-4 px-4 py-2 text-gray-400 hover:text-red-500 rounded-xl text-sm font-bold">Clear All</button>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-pink-200 p-12">
          <h3 className="text-2xl font-black text-gray-800 mb-4">Waiting for data...</h3>
          <p className="text-gray-500">Visit Amazon product pages to capture deals</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deals.map(deal => (
            <ProductCard 
              key={deal.asin} 
              deal={deal} 
              isSelected={selectedAsins.includes(deal.asin)}
              onSelect={toggleSelect}
              onGenerateSingle={handleGenerateSingle}
              isGenerating={isGenerating}
            />
          ))}
        </div>
      )}

      {selectedAsins.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button onClick={handleBulkGenerate} disabled={isGenerating} className="bg-pink-600 text-white px-10 py-5 rounded-3xl font-black uppercase shadow-2xl disabled:opacity-50">
            {isGenerating ? 'Generating...' : `Generate Campaign (${selectedAsins.length})`}
          </button>
        </div>
      )}

      {activeGeneration && <ScriptView script={activeGeneration} onClose={() => setActiveGeneration(null)} />}
    </div>
  );
};

export default Dashboard;
