import React, { useState, useEffect } from 'react';
import { ProductDeal, RawData, Persona } from '../types';
import ProductCard from './ProductCard';
import CampaignOutputView from './CampaignOutput';
import { generateCampaign } from '../services/campaignGenerator';

interface DashboardProps {
  deals: ProductDeal[];
  onIngest: (data: RawData) => void;
  onClear: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ deals, onIngest, onClear }) => {
  const [selectedAsins, setSelectedAsins] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  
  // Load persona from localStorage or default to girlmath
  const [persona, setPersona] = useState<Persona>(() => {
    const saved = localStorage.getItem('asin-watcher-persona');
    return (saved === 'leisureking' ? 'leisureking' : 'girlmath') as Persona;
  });
  
  // Save persona to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('asin-watcher-persona', persona);
  }, [persona]);

  const toggleSelect = (asin: string) => {
    setSelectedAsins(prev => 
      prev.includes(asin) ? prev.filter(a => a !== asin) : [...prev, asin]
    );
  };

  const handleBulkGenerate = async () => {
    const selectedDeals = deals.filter(d => selectedAsins.includes(d.asin) && d.status === 'Ready');
    if (selectedDeals.length === 0) {
      alert('Please select at least one Ready product');
      return;
    }
    
    setIsGenerating(true);
    try {
      const campaign = await generateCampaign(selectedDeals, persona);
      setActiveCampaign(campaign);
      setSelectedAsins([]); 
    } catch (err) {
      console.error('Generation error:', err);
      alert("Failed to generate campaign. Make sure your Gemini API key is set.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSingle = async (asin: string) => {
    const deal = deals.find(d => d.asin === asin);
    if (!deal || deal.status !== 'Ready') {
      alert('Product must be Ready to generate');
      return;
    }
    
    setIsGenerating(true);
    try {
      const campaign = await generateCampaign([deal], persona);
      setActiveCampaign(campaign);
    } catch (err) {
      console.error('Generation error:', err);
      alert("Failed to generate campaign. Make sure your Gemini API key is set.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Deal Hub</h2>
            <p className="text-sm text-gray-500">
              {deals.length} total | {deals.filter(d => d.status === 'Ready').length} ready | {selectedAsins.length} selected
            </p>
          </div>
          <button 
            onClick={onClear} 
            className="px-4 py-2 text-gray-400 hover:text-red-500 rounded-xl text-sm font-bold transition-colors"
          >
            Clear All
          </button>
        </div>
        
        {/* Persona Toggle */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <span className="text-sm font-bold text-gray-600">Video Style:</span>
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setPersona('girlmath')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                persona === 'girlmath'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💖 Girl Math
            </button>
            <button
              onClick={() => setPersona('leisureking')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                persona === 'leisureking'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👔 Leisure King
            </button>
          </div>
          <span className="text-xs text-gray-400 ml-2">
            {persona === 'girlmath' ? 'Homemade video • Girl math vibes' : 'AI-generated • Cynical humor'}
          </span>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-pink-200 p-12">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-2xl font-black text-gray-800 mb-4">Waiting for data...</h3>
          <p className="text-gray-500">Visit Amazon product pages and use the extension to capture deals</p>
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
          <button 
            onClick={handleBulkGenerate} 
            disabled={isGenerating} 
            className="bg-pink-600 text-white px-10 py-5 rounded-3xl font-black uppercase shadow-2xl hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            {isGenerating ? (
              <span className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
                Generating Magic...
              </span>
            ) : (
              `✨ Generate Campaign (${selectedAsins.length})`
            )}
          </button>
        </div>
      )}

      {activeCampaign && (
        <CampaignOutputView 
          campaign={activeCampaign} 
          onClose={() => setActiveCampaign(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
