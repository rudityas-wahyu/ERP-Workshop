'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { supabase } from '@/src/lib/supabase';
import { useSettingsStore } from '@/src/store/settings';
import EditTransactionModal from '@/src/components/modals/EditTransactionModal';

export default function Invoices() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const { formatCurrency } = useSettingsStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: invs } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    const { data: recs } = await supabase.from('receipts').select('*, workshop_queue(service_id)').order('created_at', { ascending: false });
    
    const all = [
      ...(invs || []).map(i => ({
        id: i.id,
        date: i.created_at,
        ref: i.invoice_id,
        desc: i.customer,
        amount: i.amount,
        status: i.status,
        type: 'Manual Invoice'
      })),
      ...(recs || []).map(r => ({
        id: r.id,
        date: r.created_at,
        ref: r.receipt_id,
        desc: r.receipt_id?.startsWith('POS') ? 'Retail Sale' : 'Workshop Service ' + (r.workshop_queue?.service_id || r.service_id),
        amount: r.total,
        status: 'Paid',
        type: r.receipt_id?.startsWith('POS') ? 'POS Receipt' : 'Service Receipt'
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setTransactions(all);
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Invoices & Receipts</h1>
          <p className="text-sm text-zinc-500 mt-1">All generated billing documents from services and sales.</p>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium text-zinc-400">Date</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Reference No.</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Description</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Type</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Status</th>
                <th className="px-6 py-4 font-medium text-zinc-400 text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Loading documents...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No documents found.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id + tx.ref} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 text-zinc-300">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono text-zinc-300">{tx.ref}</td>
                    <td className="px-6 py-4 text-zinc-300">{tx.desc}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs">{tx.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs">{tx.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-100">{formatCurrency(tx.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedTx(tx)} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded transition-colors">
                        View / Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <EditTransactionModal 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
        onSuccess={fetchData} 
        transaction={selectedTx} 
      />
    </AppLayout>
  );
}
