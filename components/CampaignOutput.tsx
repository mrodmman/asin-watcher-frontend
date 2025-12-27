import React, { useState } from 'react';
import { CampaignOutput } from '../types';
import CouponImageGenerator from './CouponImageGenerator';
import { copyToClipboard, downloadCSV, downloadImage } from '../services/imageUtils';

interface Props {
  campaign: CampaignOutput;
  onClose: () => void;
}

const CampaignOutputView: React.FC<Props> = ({ campaign, onClose }) => {
  const [activeTab, setActiveTab] = useState<'script' | 'images' | 'csv'>('script');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadCSV = () => {
    downloadCSV(campaign.csvContent, `campaign-${Date.now()}.csv`);
  };

  const handleDownloadProductImage = async (imageUrl: string, asin: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `product-${asin}.jpg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download product image');
    }
  };

  const handleCopyProductImage = async (imageUrl: string, asin: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopied(`product-${asin}`);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      alert('Failed to copy image to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-7xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-500 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold">Campaign Generated! 🎉</h2>
            <p className="text-sm opacity-90">{campaign.products.length} products ready for TikTok</p>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex gap-1 p-2">
            {[
              { id: 'script', label: '📝 Script & Summary', icon: '📝' },
              { id: 'images', label: '🎨 Product & Coupon Images', icon: '🎨' },
              { id: 'csv', label: '📊 CSV Export', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-pink-600 shadow-md'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* SCRIPT TAB */}
          {activeTab === 'script' && (
            <div className="space-y-8">
              {/* Video Script */}
              <div className="bg-pink-50 rounded-2xl p-6 border-2 border-pink-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">📹 TikTok Video Script</h3>
                  <button
                    onClick={() => handleCopy(campaign.videoScript, 'script')}
                    className="px-4 py-2 bg-pink-600 text-white rounded-xl font-bold text-sm hover:bg-pink-700"
                  >
                    {copied === 'script' ? '✓ Copied!' : '📋 Copy Script'}
                  </button>
                </div>
                <div className="bg-white rounded-xl p-6 text-gray-800 leading-relaxed whitespace-pre-wrap font-serif italic text-lg">
                  {campaign.videoScript}
                </div>
              </div>

              {/* Editing Summary */}
              <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">✂️ Editing Summary</h3>
                  <button
                    onClick={() => handleCopy(campaign.editingSummary, 'summary')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700"
                  >
                    {copied === 'summary' ? '✓ Copied!' : '📋 Copy Summary'}
                  </button>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <pre className="text-gray-800 font-mono text-sm whitespace-pre-wrap">
                    {campaign.editingSummary}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* IMAGES TAB */}
          {activeTab === 'images' && (
            <div className="space-y-8">
              {campaign.products.map((product, index) => (
                <div key={product.asin} className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {index + 1}. {product.cleanName}
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Product Image */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-700">Product Image</h4>
                      <div className="relative bg-white rounded-xl p-4 border-2 border-gray-200">
                        <img 
                          src={product.imageUrl} 
                          alt={product.cleanName}
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyProductImage(product.imageUrl, product.asin)}
                          className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700"
                        >
                          {copied === `product-${product.asin}` ? '✓ Copied!' : '📋 Copy Image'}
                        </button>
                        <button
                          onClick={() => handleDownloadProductImage(product.imageUrl, product.asin)}
                          className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    </div>

                    {/* Coupon Image Generator */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-700">Coupon Code Image</h4>
                      <CouponImageGenerator product={product} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CSV TAB */}
          {activeTab === 'csv' && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">📊 Campaign Data (CSV)</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(campaign.csvContent, 'csv')}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700"
                    >
                      {copied === 'csv' ? '✓ Copied!' : '📋 Copy CSV'}
                    </button>
                    <button
                      onClick={handleDownloadCSV}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700"
                    >
                      ⬇️ Download CSV
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 overflow-x-auto">
                  <pre className="text-gray-800 font-mono text-xs whitespace-pre">
                    {campaign.csvContent}
                  </pre>
                </div>
              </div>

              {/* CSV Preview Table */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 overflow-x-auto">
                <h4 className="font-bold text-gray-800 mb-4">Preview</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-3 font-bold text-gray-700">Product</th>
                      <th className="text-left p-3 font-bold text-gray-700">Regular</th>
                      <th className="text-left p-3 font-bold text-gray-700">Sale</th>
                      <th className="text-left p-3 font-bold text-gray-700">Code</th>
                      <th className="text-left p-3 font-bold text-gray-700">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.products.map(p => (
                      <tr key={p.asin} className="border-b border-gray-200">
                        <td className="p-3">{p.cleanName}</td>
                        <td className="p-3">${p.regularPrice}</td>
                        <td className="p-3 font-bold text-green-600">${p.salePrice}</td>
                        <td className="p-3 font-mono text-xs bg-gray-100 rounded">{p.code}</td>
                        <td className="p-3">
                          <a 
                            href={p.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Amazon Link →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <strong>{campaign.products.length}</strong> products | Generated {new Date().toLocaleString()}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignOutputView;
