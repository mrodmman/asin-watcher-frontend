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
