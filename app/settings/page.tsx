'use client';

import AppLayout from '@/src/components/AppLayout';
import { useSettingsStore } from '@/src/store/settings';
import { useAuthStore } from '@/src/store/auth';
import { useState } from 'react';
import Image from 'next/image';
import { Store, UserCircle, Database, Image as ImageIcon } from 'lucide-react';

export default function SettingsPage() {
  const { currency, setCurrency, workshopName, workshopAddress, workshopPhone, logoUrl, setWorkshopDetails } = useSettingsStore();
  const { user, setUser, password, setPassword } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<any>(user?.role || 'Admin');
  const [newPassword, setNewPassword] = useState('');

  const [wName, setWName] = useState(workshopName || '');
  const [wAddress, setWAddress] = useState(workshopAddress || '');
  const [wPhone, setWPhone] = useState(workshopPhone || '');
  const [wLogo, setWLogo] = useState(logoUrl || '');

  const [activeTab, setActiveTab] = useState('workshop');

  const handleSaveAuth = () => {
    setUser({ name, role });
    if (newPassword) {
      setPassword(newPassword);
      setNewPassword('');
    }
    alert('User info saved');
  };

  const handleSaveWorkshop = () => {
    setWorkshopDetails({
      workshopName: wName,
      workshopAddress: wAddress,
      workshopPhone: wPhone,
      logoUrl: wLogo
    });
    alert('Workshop info saved');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setWLogo(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
          <div className="mb-6 px-3">
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Settings</h1>
            <p className="text-xs text-zinc-500 mt-1">Manage your application preferences.</p>
          </div>
          
          <button 
            onClick={() => setActiveTab('workshop')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'workshop' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'}`}
          >
            <Store className="w-4 h-4" />
            Workshop Details
          </button>
          <button 
            onClick={() => setActiveTab('user')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'user' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'}`}
          >
            <UserCircle className="w-4 h-4" />
            User Profile
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'system' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'}`}
          >
            <Database className="w-4 h-4" />
            System & Database
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-zinc-900/20 border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col">
          {activeTab === 'workshop' && (
            <div className="p-8 overflow-y-auto flex-1">
              <h2 className="text-lg font-medium text-zinc-100 mb-6">Workshop Details</h2>
              <div className="max-w-2xl space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Workshop Logo</label>
                  <div className="flex items-start gap-6">
                    {wLogo ? (
                      <div className="w-24 h-24 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden relative flex-shrink-0">
                        <Image src={wLogo} alt="Logo" fill className="object-contain" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-zinc-950 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-[10px] uppercase tracking-widest">No Logo</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 pt-2">
                      <label className="cursor-pointer inline-flex px-4 py-2 bg-zinc-100 hover:bg-white transition-colors rounded-md text-xs font-medium text-zinc-900 shadow-sm w-max">
                        Upload Image
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-zinc-500">
                        Recommended: Square image (1:1), at least 256x256px.<br/>
                        Max file size: 2MB. Format: PNG, JPG.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Workshop Name</label>
                    <input 
                      type="text" 
                      value={wName}
                      onChange={(e) => setWName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Address</label>
                    <textarea 
                      value={wAddress}
                      onChange={(e) => setWAddress(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Phone Number</label>
                    <input 
                      type="text" 
                      value={wPhone}
                      onChange={(e) => setWPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-800/50">
                  <button 
                    onClick={handleSaveWorkshop}
                    className="px-6 py-2.5 bg-emerald-500 text-emerald-950 font-medium rounded-md text-sm hover:bg-emerald-400 transition-colors shadow-sm"
                  >
                    Save Workshop Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'user' && (
            <div className="p-8 overflow-y-auto flex-1">
              <h2 className="text-lg font-medium text-zinc-100 mb-6">User Profile</h2>
              <div className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Display Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Role</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-zinc-600 transition-colors"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>
                <div className="pt-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                
                <div className="pt-4 border-t border-zinc-800/50">
                  <button 
                    onClick={handleSaveAuth}
                    className="px-6 py-2.5 bg-emerald-500 text-emerald-950 font-medium rounded-md text-sm hover:bg-emerald-400 transition-colors shadow-sm"
                  >
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="p-8 overflow-y-auto flex-1">
              <h2 className="text-lg font-medium text-zinc-100 mb-6">System & Database</h2>
              <div className="max-w-2xl space-y-8">
                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">Regional Settings</h3>
                  <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-5">
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Default Currency</label>
                    <select 
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value as any)}
                      className="w-full max-w-xs bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-zinc-600 transition-colors"
                    >
                      <option value="IDR">IDR (Rp)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                    <p className="text-xs text-zinc-500 mt-2">
                      Note: Transactions are stored in a base currency and formatted automatically.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">Connection Status</h3>
                  <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Database className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-100">Supabase Cloud Database</div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-emerald-400">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Connected and Syncing
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Your workshop queue, sales history, and inventory data are securely stored in the cloud. Real-time updates are enabled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
