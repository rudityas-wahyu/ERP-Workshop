'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { supabase } from '@/src/lib/supabase';
import { useSettingsStore } from '@/src/store/settings';
import { Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import EditTransactionModal from '@/src/components/modals/EditTransactionModal';

export default function Invoices() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { formatCurrency } = useSettingsStore();

  useEffect(() => {
    fetchData();
  }, []);

  // reset page if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterMonth, filterType]);

  const fetchData = async () => {
    setLoading(true);
    const { data: invs } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    const { data: recs } = await supabase.from('receipts').select('*, workshop_queue(*)').order('created_at', { ascending: false });
    
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
        desc: r.receipt_id?.startsWith('POS') ? (r.payment_method && r.payment_method.includes('|') ? 'Retail Sale||' + r.payment_method.split('|')[1] : 'Retail Sale') : 'Workshop Service ' + (r.workshop_queue?.service_id || r.service_id) + '||' + (r.workshop_queue?.guitar_brand || '') + ' ' + (r.workshop_queue?.guitar_model || '') + ' | ' + (r.workshop_queue?.problem_description || ''),
        amount: r.total,
        status: 'Paid',
        type: r.receipt_id?.startsWith('POS') ? 'POS Receipt' : 'Service Receipt'
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setTransactions(all);
    setLoading(false);
  };

  const availableMonths = Array.from(new Set(transactions.map(tx => {
    const d = new Date(tx.date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }))).sort().reverse();

  const filteredTransactions = transactions.filter(tx => {
    const d = new Date(tx.date);
    const txMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const matchMonth = filterMonth === 'all' || txMonth === filterMonth;
    const matchType = filterType === 'all' || tx.type === filterType;
    return matchMonth && matchType;
  });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const formatMonth = (m: string) => {
    if (m === 'all') return 'All Time';
    const [year, month] = m.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <AppLayout>
      <div className="w-full px-4 space-y-6 pb-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Invoices & Receipts</h1>
            <p className="text-sm text-zinc-500 mt-1">All generated billing documents from services and sales.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-transparent text-xs text-zinc-300 outline-none border border-zinc-800 rounded px-2 py-1 cursor-pointer">
                <option value="all" className="bg-zinc-900">All Types</option>
                <option value="Manual Invoice" className="bg-zinc-900">Manual Invoice</option>
                <option value="POS Receipt" className="bg-zinc-900">POS Receipt</option>
                <option value="Service Receipt" className="bg-zinc-900">Service Receipt</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="bg-transparent text-xs text-zinc-300 outline-none border border-zinc-800 rounded px-2 py-1 cursor-pointer">
                <option value="all" className="bg-zinc-900">All Periods</option>
                {availableMonths.map(m => (
                  <option key={m} value={m} className="bg-zinc-900">{formatMonth(m)}</option>
                ))}
              </select>
            </div>
          </div>
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
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No documents found.</td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
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
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-zinc-800/50 flex items-center justify-between bg-zinc-950/30">
              <div className="text-xs text-zinc-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-zinc-300 font-medium px-2">{currentPage} / {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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
