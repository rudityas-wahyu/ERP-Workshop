'use client';

import { useAuthStore } from '@/src/store/auth';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/src/store/settings';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login } = useAuthStore();
  const { workshopName, logoUrl, fetchSettings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  if (!mounted) return null;

  if (!isAuthenticated) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const success = login(password);
      if (!success) {
        setError('Incorrect password');
      }
    };

    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-xl max-w-sm w-full">
          <div className="flex flex-col items-center mb-8">
            {logoUrl ? (
              <img src={logoUrl} alt={workshopName} className="w-16 h-16 rounded-xl object-cover mb-4 shadow-sm border border-zinc-800/50" />
            ) : (
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-zinc-950 text-xl font-bold tracking-tighter mb-4 shadow-sm">
                {(workshopName || 'GW').substring(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-medium text-zinc-100">{workshopName || 'Guitar Workshop'}</h1>
            <p className="text-sm text-zinc-500 mt-1">Sign in to access POS & Queue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Hint: password123"
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-zinc-700"
              />
              {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
            </div>
            <button 
              type="submit"
              className="w-full py-2 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-md text-sm transition-colors"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
