'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { supabase } from '@/src/lib/supabase';
import { useSettingsStore } from '@/src/store/settings';
import CurrencyInput from '@/src/components/CurrencyInput';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import RecordPastServiceModal from '@/src/components/modals/RecordPastServiceModal';
import EditTransactionModal from '@/src/components/modals/EditTransactionModal';
import { useUIStore } from '@/src/store/ui';

export default function Finance() {
  const { addToast } = useUIStore();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency, formatCurrency } = useSettingsStore();
  const getCurrencySymbol = () => currency === 'IDR' ? 'Rp' : currency === 'EUR' ? '€' : '$';

  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showPastServiceModal, setShowPastServiceModal] = useState(false);
  const [editTx, setEditTx] = useState<any>(null);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualDesc, setManualDesc] = useState('');
  const [manualAmount, setManualAmount] = useState(0);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: invs } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    const { data: recs } = await supabase.from('receipts').select('*, workshop_queue(*)').order('created_at', { ascending: false });
    
    setInvoices(invs || []);
    setReceipts(recs || []);
    setLoading(false);
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
    const nextId = (count || 0) + 1;
    const invoice_id = 'HIST-' + nextId.toString().padStart(2, '0');
    const { error } = await supabase.from('invoices').insert([{
      invoice_id,
      customer: manualDesc || 'Manual Entry',
      amount: manualAmount,
      status: 'Paid',
      created_at: new Date(manualDate).toISOString()
    }]);

    if (!error) {
      addToast("Historical record added success", 'success');
      setShowManualAdd(false);
      setManualDesc('');
      setManualAmount(0);
      fetchData();
    } else {
      addToast("Error adding record: " + error.message, 'error');
    }
  };

  const allTransactions = [
    ...invoices.filter(i => i.status === 'Paid').map(i => ({
      id: i.id,
      date: i.created_at,
      ref: i.invoice_id,
      desc: i.customer,
      amount: i.amount,
      type: 'Invoice / POS'
    })),
    ...receipts.map(r => ({
      id: r.id,
      date: r.created_at,
      ref: r.receipt_id,
      desc: r.receipt_id?.startsWith('POS') ? (r.payment_method && r.payment_method.includes('|') ? 'Retail Sale||' + r.payment_method.split('|')[1] : 'Retail Sale') : 'Workshop Service ' + (r.workshop_queue?.service_id || r.service_id) + '||' + (r.workshop_queue?.guitar_brand || '') + ' ' + (r.workshop_queue?.guitar_model || '') + ' | ' + (r.workshop_queue?.problem_description || ''),
      amount: r.total,
      type: r.receipt_id?.startsWith('POS') ? 'POS Receipt' : 'Service Receipt'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const availableMonths = Array.from(new Set(allTransactions.map(tx => {
    const d = new Date(tx.date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }))).sort().reverse();

  const filteredTransactions = allTransactions.filter(tx => {
    const d = new Date(tx.date);
    const txMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const matchMonth = filterMonth === 'all' || txMonth === filterMonth;
    const matchType = filterType === 'all' || tx.type === filterType;
    return matchMonth && matchType;
  });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Calculate totals based on filtered data
  const filteredInvoiceRev = filteredTransactions.filter(t => t.type === 'Invoice / POS').reduce((acc, curr) => acc + curr.amount, 0);
  const filteredPOSRev = filteredTransactions.filter(t => t.type === 'POS Receipt').reduce((acc, curr) => acc + curr.amount, 0);
  const filteredServiceRev = filteredTransactions.filter(t => t.type === 'Service Receipt').reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalRetailRev = filteredInvoiceRev + filteredPOSRev;
  const totalRevenue = totalRetailRev + filteredServiceRev;
  
  // reset page if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterMonth, filterType]);

  const formatMonth = (m: string) => {
    if (m === 'all') return 'All Time';
    const [year, month] = m.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  return (
    <AppLayout
      headerAction={
        <div className="flex gap-3">
          <button onClick={() => setShowManualAdd(true)} className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-colors text-zinc-100 rounded-md font-medium text-xs tracking-tight shadow-sm">
            + Record Custom Income
          </button>
          <button onClick={() => setShowPastServiceModal(true)} className="px-4 py-2 bg-zinc-100 hover:bg-white transition-colors text-zinc-900 rounded-md font-medium text-xs tracking-tight shadow-sm">
            + Add Past Workshop Service
          </button>
        </div>
      }
    >
      <div className="w-full px-4 w-full space-y-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
            <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-2">Total Revenue</p>
            <div className="flex items-baseline gap-2 mt-auto">
              <p className="text-3xl font-semibold tracking-tight text-emerald-400">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
          
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
            <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-2">POS & Retail</p>
            <div className="flex items-baseline gap-2 mt-auto">
              <p className="text-2xl font-semibold tracking-tight text-zinc-100">{formatCurrency(totalRetailRev)}</p>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
            <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-2">Workshop Services</p>
            <div className="flex items-baseline gap-2 mt-auto">
              <p className="text-2xl font-semibold tracking-tight text-zinc-100">{formatCurrency(filteredServiceRev)}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-950/50">
            <h2 className="text-sm font-medium tracking-tight text-zinc-100">Combined Transaction History</h2>
                        <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-transparent text-xs text-zinc-300 outline-none border border-zinc-800 rounded px-2 py-1 cursor-pointer">
                  <option value="all" className="bg-zinc-900">All Types</option>
                  <option value="Invoice / POS" className="bg-zinc-900">Invoice / POS</option>
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
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/90 backdrop-blur-md">
                <tr className="border-b border-zinc-800/50 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Ref ID</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 text-xs">Loading financial data...</td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 text-xs">No transactions recorded yet</td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx, idx) => (
                    <tr key={`${tx.ref}-${idx}`} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                        {tx.ref}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {tx.desc?.includes('||') ? (
                          <>
                            <div className="text-zinc-200 font-medium">{tx.desc.split('||')[0]}</div>
                            <div className="text-zinc-500 text-[10px] mt-0.5 whitespace-normal max-w-[300px]">{tx.desc.split('||')[1]}</div>
                          </>
                        ) : (
                          <span className="text-zinc-200">{tx.desc}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-medium rounded-md text-zinc-400">
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-emerald-400">
                        +{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setEditTx(tx)} className="text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md transition-colors">
                          View / Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
        isOpen={!!editTx} 
        onClose={() => setEditTx(null)} 
        onSuccess={fetchData} 
        transaction={editTx} 
      />
      <RecordPastServiceModal isOpen={showPastServiceModal} onClose={() => setShowPastServiceModal(false)} onSuccess={fetchData} />

      {showManualAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-medium text-zinc-100 mb-2">Record Past Retail POS Sale</h2>
            <p className="text-xs text-zinc-400 mb-6">Add past sales or services to update your financial dashboard.</p>
            
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Transaction Date</label>
                <input required type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                <input required type="text" placeholder="e.g. Past Service - Fender Refret" value={manualDesc} onChange={e => setManualDesc(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Amount</label>
                <CurrencyInput value={manualAmount} onChange={setManualAmount} required />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowManualAdd(false)} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-white transition-colors rounded-md text-xs font-medium">
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
