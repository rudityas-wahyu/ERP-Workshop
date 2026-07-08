import { create } from 'zustand';
import { supabase } from '../lib/supabase';

type Currency = 'IDR' | 'USD' | 'EUR';

interface SettingsState {
  currency: Currency;
  exchangeRates: { IDR: number; EUR: number; USD: number };
  workshopName: string;
  workshopAddress: string;
  workshopPhone: string;
  logoUrl: string | null;
  setCurrency: (currency: Currency) => void;
  setWorkshopDetails: (details: { workshopName?: string; workshopAddress?: string; workshopPhone?: string; logoUrl?: string | null }) => Promise<void>;
  formatCurrency: (amount: number) => string;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  currency: 'IDR',
  exchangeRates: { IDR: 16000, EUR: 0.92, USD: 1 },
  workshopName: 'Guitar Workshop',
  workshopAddress: '123 Luthier Street, Music City',
  workshopPhone: '+1 234 567 8900',
  logoUrl: null,
  setCurrency: async (currency) => {
    set({ currency });
    await supabase.from('app_settings').update({ currency }).eq('id', 1);
  },
  setWorkshopDetails: async (details) => {
    set((state) => ({ ...state, ...details }));
    await supabase.from('app_settings').update({
      workshop_name: details.workshopName,
      workshop_address: details.workshopAddress,
      workshop_phone: details.workshopPhone,
      logo_url: details.logoUrl
    }).eq('id', 1);
  },
  fetchSettings: async () => {
    try {
      const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (data && !error) {
        set({
          workshopName: data.workshop_name || 'Guitar Workshop',
          workshopAddress: data.workshop_address || '123 Luthier Street, Music City',
          workshopPhone: data.workshop_phone || '+1 234 567 8900',
          logoUrl: data.logo_url || null,
          currency: (data.currency as Currency) || 'IDR'
        });
      }
    } catch (e) {
      console.log('App settings table not found, using defaults.');
    }
  },
  formatCurrency: (amount: number) => {
    const { currency } = get();
    if (currency === 'IDR') {
      const formatted = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount);
      return `Rp ${formatted},-`;
    } else if (currency === 'EUR') {
      return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  },
}));