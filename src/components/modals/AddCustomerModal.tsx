'use client';
import { useState } from 'react';
import { supabase } from '@/src/lib/supabase';

export default function AddCustomerModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('customers').insert([{ 
      name, 
      email, 
      phone,
      is_member: isMember,
      member_discount_percentage: isMember ? discount : 0
    }]);
    
    if (!error) {
      await supabase.from('audit_log').insert([{
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: 'CRM',
        details: `${name} added to CRM`
      }]);
    }
    
    setLoading(false);
    if (!error) {
      setName(''); setEmail(''); setPhone(''); setIsMember(false); setDiscount(0);
      onSuccess();
      onClose();
    } else {
      alert("Error adding customer: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-medium text-zinc-100 mb-4">Add Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Full Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Phone Number</label>
              <input required type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/50 mt-4">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-300">
              <input type="checkbox" checked={isMember} onChange={e => setIsMember(e.target.checked)} className="rounded border-zinc-800 bg-zinc-900 text-zinc-100" />
              Register as Member
            </label>
            {isMember && (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 mt-2">Member Discount (%)</label>
                <input type="number" min="0" max="100" value={discount} onChange={e => setDiscount(parseFloat(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-white transition-colors rounded-md text-xs font-medium disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
