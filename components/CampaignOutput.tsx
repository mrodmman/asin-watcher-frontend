import React, { useState } from 'react';
import { CampaignOutput } from '../types';
import CouponImageGenerator from './CouponImageGenerator';
import { copyToClipboard, downloadCSV, downloadImage, copyImageFromUrl } from '../services/imageUtils';

interface Props {
  campaign: CampaignOutput;
  onClose: () => void;
}

const CampaignOutputView: React.FC<Props> = ({ campaign, onClose }) => {
  const [activeTab, setActiveTab] = useState<'aiprompt' | 'script' | 'images' | 'csv' | 'youtube'>(
    campaign.persona === 'leisureking' ? 'aiprompt' : 'script'
  );
  const [copied, setCopied] = useState<string | null>(null);
  
  const isLeisureKing = campaign.persona === 'leisureking';

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
      const success = await copyImageFromUrl(imageUrl);
      if (success) {
        setCopied(`product-${asin}`);
        setTimeout(() => setCopied(null), 2000);
      } else {
        alert('Failed to copy image. Image opened in new tab - right-click to copy.');
      }
    } catch (error) {
      alert('Failed to copy image to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-7xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className={`p-6 flex justify-between items-center text-white ${
          isLeisureKing 
            ? 'bg-gradient-to-r from-purple-800 to-purple-600' 
            : 'bg-gradient-to-r from-pink-600 to-rose-500'
        }`}>
          <div>
            <h2 className="text-2xl font-bold">
              {isLeisureKing ? 'The Leisure King Campaign 👔' : 'Campaign Generated! 🎉'}
            </h2>
            <p className="text-sm opacity-90">
              {campaign.products.length} products ready for {isLeisureKing ? 'AI video generation' : 'TikTok'}
            </p>
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
            {isLeisureKing && (
              <button
                onClick={() => setActiveTab('aiprompt')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'aiprompt'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                🎬 AI Video Prompt
              </button>
            )}
            <button
              onClick={() => setActiveTab('script')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'script'
                  ? `bg-white shadow-md ${isLeisureKing ? 'text-purple-600' : 'text-pink-600'}`
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              📝 Script & Summary
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'images'
                  ? `bg-white shadow-md ${isLeisureKing ? 'text-purple-600' : 'text-pink-600'}`
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              🎨 Product & Coupon Images
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'csv'
                  ? `bg-white shadow-md ${isLeisureKing ? 'text-purple-600' : 'text-pink-600'}`
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              📊 CSV Export
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'youtube'
                  ? `bg-white shadow-md ${isLeisureKing ? 'text-purple-600' : 'text-pink-600'}`
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              🎬 YouTube Content
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* AI VIDEO PROMPT TAB (Leisure King only) */}
          {activeTab === 'aiprompt' && isLeisureKing && campaign.aiVideoPrompt && (
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">🎬 AI Background Video Prompt</h3>
                  <button
                    onClick={() => handleCopy(campaign.aiVideoPrompt!, 'aiprompt')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700"
                  >
                    {copied === 'aiprompt' ? '✓ Copied!' : '📋 Copy Prompt'}
                  </button>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <pre className="text-gray-800 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {campaign.aiVideoPrompt}
                  </pre>
                </div>
                <div className="mt-4 p-4 bg-purple-100 rounded-xl">
                  <p className="text-sm text-purple-800">
                    <strong>🎥 Use with:</strong> Kling AI, Veo, Runway, or any AI video generator that accepts text prompts.
                    Paste this prompt to generate your background video, then overlay your products and text in editing.
                  </p>
                </div>
              </div>
            </div>
          )}
          
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
                    {/* Product Image (Always show) */}
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
                      <CouponImageGenerator product={product} persona={campaign.persona} />
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

          {/* YouTube Tab */}
          {activeTab === 'youtube' && campaign.youtubeContent && (
            <div className="space-y-6">
              {/* Title Options */}
              <div className={`rounded-2xl p-6 border-2 ${isLeisureKing ? 'bg-purple-50 border-purple-100' : 'bg-pink-50 border-pink-100'}`}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">📺 Video Title Options</h3>
                <p className="text-sm text-gray-600 mb-4">Choose one title for your video. Click to copy!</p>
                <div className="space-y-3">
                  {campaign.youtubeContent.titles.map((title, index) => (
                    <div key={index} className="relative">
                      <button
                        onClick={() => handleCopy(title, `title-${index}`)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          copied === `title-${index}`
                            ? 'bg-green-100 border-green-400'
                            : 'bg-white border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="text-xs font-bold text-gray-500 mb-1">
                              {index === 0 && 'FORMAT 1: Price Shock'}
                              {index === 1 && 'FORMAT 2: Emotional Hook'}
                              {index === 2 && 'FORMAT 3: Direct Value'}
                              {index === 3 && 'FORMAT 4: Urgency'}
                              {index === 4 && 'FORMAT 5: Cynical (On Brand)'}
                            </div>
                            <div className="font-bold text-gray-800">{title}</div>
                          </div>
                          <div className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                            copied === `title-${index}`
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {copied === `title-${index}` ? '✓ Copied' : '📋 Copy'}
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">📝 Video Description</h3>
                  <button
                    onClick={() => handleCopy(campaign.youtubeContent.description, 'description')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700"
                  >
                    {copied === 'description' ? '✓ Copied!' : '📋 Copy Description'}
                  </button>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <pre className="text-gray-800 text-sm whitespace-pre-wrap font-sans">
                    {campaign.youtubeContent.description}
                  </pre>
                </div>
                <div className="mt-4 text-xs text-gray-600 bg-white rounded-lg p-4">
                  <strong>💡 Tip:</strong> Copy and paste this directly into your YouTube video description. 
                  Update the site URL if you're using a custom domain!
                </div>
              </div>

              {/* Hashtags */}
              <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">#️⃣ Hashtags</h3>
                  <button
                    onClick={() => handleCopy(campaign.youtubeContent.hashtags, 'hashtags')}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700"
                  >
                    {copied === 'hashtags' ? '✓ Copied!' : '📋 Copy Hashtags'}
                  </button>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <div className="text-gray-800 font-bold text-lg">
                    {campaign.youtubeContent.hashtags}
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-600 bg-white rounded-lg p-4">
                  <strong>💡 Tip:</strong> YouTube only shows the first 3 hashtags above your video title. 
                  These are optimized with primary hashtags first, followed by category-specific tags.
                </div>
              </div>

              {/* Quick Copy All Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                <h4 className="font-bold text-gray-800 mb-4">⚡ Quick Upload Checklist</h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">1️⃣</span>
                    <div>
                      <strong>Title:</strong> Choose one from above (copy with one click)
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">2️⃣</span>
                    <div>
                      <strong>Description:</strong> Copy the full description (includes disclosure)
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">3️⃣</span>
                    <div>
                      <strong>Hashtags:</strong> Add at the end of description or in tags section
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">4️⃣</span>
                    <div>
                      <strong>Pin Comment:</strong> "⚠️ This video contains affiliate links. As an Amazon Associate, I earn from qualifying purchases at no extra cost to you."
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">5️⃣</span>
                    <div>
                      <strong>Check box:</strong> "Yes, it contains a paid promotion" when uploading
                    </div>
                  </div>
                </div>
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
