'use client';
import { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import CurrencyInput from '@/src/components/CurrencyInput';

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState(0);
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
    const nextId = (count || 0) + 1;
    const invoice_id = 'INV-' + nextId.toString().padStart(2, '0');
    const { error } = await supabase.from('invoices').insert([{ 
      invoice_id, customer, amount, status: 'Pending', created_at: new Date(createdAt).toISOString()
    }]);
    
    // Also log it in audit
    if (!error) {
      await supabase.from('audit_log').insert([{
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: 'Invoice Created',
        details: `${invoice_id} for ${customer}`
      }]);
    }
    
    setLoading(false);
    if (!error) {
      setCustomer(''); setAmount(0);
      onSuccess();
      onClose();
    } else {
      alert("Error creating invoice");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-medium text-zinc-100 mb-4">Create Invoice</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Date</label>
            <input required type="date" value={createdAt} onChange={e => setCreatedAt(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Customer Name</label>
            <input required type="text" value={customer} onChange={e => setCustomer(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Amount ($)</label>
            <CurrencyInput value={amount} onChange={setAmount} required />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-white transition-colors rounded-md text-xs font-medium disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
