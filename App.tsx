import React, { useState, useEffect } from 'react';
import { ProductDeal, RawData } from './types';
import Dashboard from './components/Dashboard';
import ExtensionFiles from './components/ExtensionFiles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const App: React.FC = () => {
  const [deals, setDeals] = useState<ProductDeal[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'extension'>('dashboard');
  const [backendStatus, setBackendStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        setBackendStatus(response.ok);
      } catch {
        setBackendStatus(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const response = await fetch(`${API_URL}/deals`);
        const data = await response.json();
        setDeals(data.deals || []);
      } catch (error) {
        console.error('Failed to load deals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDeals();
    const interval = setInterval(loadDeals, 5000);
    return () => clearInterval(interval);
  }, []);

  const saveDeals = async (updatedDeals: ProductDeal[]) => {
    try {
      await fetch(`${API_URL}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deals: updatedDeals })
      });
    } catch (error) {
      console.error('Failed to save deals:', error);
    }
  };

  const mergeData = (existing: ProductDeal | undefined, newData: RawData): ProductDeal => {
    const merged: ProductDeal = {
      asin: newData.asin,
      title: newData.title || existing?.title,
      price: newData.price || existing?.price,
      code: newData.code || existing?.code,
      discount: newData.discount || existing?.discount,
      lastUpdated: Date.now(),
      imageUrl: `https://picsum.photos/seed/${newData.asin}/400/400`,
      status: 'Incomplete'
    };
    if (merged.title && merged.price && (merged.code || merged.discount)) {
      merged.status = 'Ready';
    }
    return merged;
  };

  const handleIngest = (data: RawData) => {
    setDeals(prev => {
      const idx = prev.findIndex(d => d.asin === data.asin);
      const updated = [...prev];
      if (idx > -1) {
        updated[idx] = mergeData(updated[idx], data);
      } else {
        updated.unshift(mergeData(undefined, data));
      }
      saveDeals(updated);
      return updated;
    });
  };

  const clearData = async () => {
    if (confirm('Are you sure you want to clear all watched ASINs?')) {
      try {
        await fetch(`${API_URL}/deals`, { method: 'DELETE' });
        setDeals([]);
      } catch (error) {
        console.error('Failed to clear deals:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading ASIN Watcher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-pink-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-pink-500 p-2 rounded-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 brand-font">ASIN Watcher Pro</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-3 h-3 rounded-full ${backendStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-gray-600 font-medium">{backendStatus ? 'Connected' : 'Offline'}</span>
            </div>
            <nav className="flex bg-pink-50 rounded-full p-1 border border-pink-100">
              <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-white text-pink-600 shadow-sm' : 'text-pink-400'}`}>Dashboard</button>
              <button onClick={() => setActiveTab('extension')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'extension' ? 'bg-white text-pink-600 shadow-sm' : 'text-pink-400'}`}>Extension</button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {activeTab === 'dashboard' ? (
          <Dashboard deals={deals} onIngest={handleIngest} onClear={clearData} />
        ) : (
          <ExtensionFiles />
        )}
      </main>
    </div>
  );
};

export default App;
