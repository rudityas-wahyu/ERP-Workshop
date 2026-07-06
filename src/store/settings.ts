import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'IDR' | 'USD' | 'EUR';

interface SettingsState {
  currency: Currency;
  exchangeRates: { IDR: number; EUR: number; USD: number };
  workshopName: string;
  workshopAddress: string;
  workshopPhone: string;
  logoUrl: string | null;
  setCurrency: (currency: Currency) => void;
  setWorkshopDetails: (details: { workshopName?: string; workshopAddress?: string; workshopPhone?: string; logoUrl?: string | null }) => void;
  formatCurrency: (amount: number) => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      currency: 'IDR',
      exchangeRates: { IDR: 16000, EUR: 0.92, USD: 1 },
      workshopName: 'Guitar Workshop',
      workshopAddress: '123 Luthier Street, Music City',
      workshopPhone: '+1 234 567 8900',
      logoUrl: null,
      setCurrency: (currency) => set({ currency }),
      setWorkshopDetails: (details) => set((state) => ({ ...state, ...details })),
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
    }),
    {
      name: 'settings-storage',
    }
  )
);
