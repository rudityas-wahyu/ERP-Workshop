'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useSettingsStore } from '@/src/store/settings';
import CurrencyInput from '@/src/components/CurrencyInput';
import { useUIStore } from '@/src/store/ui';

export default function EditTransactionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  transaction 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  transaction: any;
}) {
  const { formatCurrency, workshopName, workshopAddress, workshopPhone } = useSettingsStore();
  const [loading, setLoading] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  
  // Form fields
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');

  // Additional details for printing
  const [fullDetails, setFullDetails] = useState<any>(null);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount);
      fetchDetails();
    }
  }, [transaction]);

  const fetchDetails = async () => {
    if (!transaction) return;
    if (transaction.type === 'Service Receipt') {
      const { data } = await supabase.from('receipts').select('*, workshop_queue(*)').eq('id', transaction.id).single();
      if (data) {
        setFullDetails(data);
        setPaymentMethod(data.payment_method);
      }
    } else {
      const { data } = await supabase.from('invoices').select('*').eq('id', transaction.id).single();
      if (data) {
        setFullDetails(data);
        setPaymentMethod(data.payment_method || 'Cash');
      }
    }
  };

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let error;
    if (transaction.type === 'Service Receipt') {
      const res = await supabase.from('receipts').update({
        total: amount,
        payment_method: paymentMethod
      }).eq('id', transaction.id);
      error = res.error;
    } else {
      const res = await supabase.from('invoices').update({
        amount: amount,
        payment_method: paymentMethod
      }).eq('id', transaction.id);
      error = res.error;
    }

    setLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    } else {
      addToast("Error updating transaction: " + error.message, 'error');
    }
  };

  if (showPrint && fullDetails) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl text-zinc-900 relative">
          <div className="text-center mb-6 border-b border-zinc-200 pb-4">
            <h2 className="text-xl font-bold tracking-tight">{workshopName || 'Guitar Workshop'}</h2>
            <p className="text-xs text-zinc-500 mt-1 whitespace-pre-wrap">{workshopAddress}</p>
            <p className="text-xs text-zinc-500">{workshopPhone}</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Receipt No:</span>
              <span className="font-mono font-medium">{transaction.ref}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Date:</span>
              <span className="font-mono">{new Date(transaction.date).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Customer:</span>
              <span className="font-medium">
                {transaction.type === 'Service Receipt' 
                  ? (fullDetails.workshop_queue?.customer_name || 'Walk-in') 
                  : (fullDetails.customer || 'Walk-in')}
              </span>
            </div>
          </div>

          <div className="border-t border-b border-zinc-200 py-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Description</span>
              <div className="text-right max-w-[200px]">
                {transaction.desc?.includes('||') ? (
                  <div className="flex flex-col">
                    <span className="font-medium">{transaction.desc.split('||')[0]}</span>
                    <span className="text-zinc-500 text-[10px] font-normal mt-0.5">{transaction.desc.split('||')[1]}</span>
                  </div>
                ) : (
                  <span className="font-medium">{transaction.desc}</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(transaction.type === 'Service Receipt' ? fullDetails.total : fullDetails.amount)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Payment Method</span>
              <span>{fullDetails.payment_method || paymentMethod}</span>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-400 mb-8">
            Thank you for your business!
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowPrint(false)} className="flex-1 py-3 text-sm font-medium text-zinc-500 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
              Close
            </button>
            <button onClick={() => window.print()} className="flex-1 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-lg font-medium text-zinc-100">Edit Transaction</h2>
          <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded">{transaction.ref}</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Total Amount</label>
            <CurrencyInput value={amount} onChange={setAmount} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Payment Method</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700">
              <option value="Cash">Cash</option>
              <option value="Transfer">Transfer</option>
              <option value="QRIS">QRIS</option>
              <option value="Card">Card</option>
            </select>
          </div>
          
          <div className="flex justify-between pt-4 mt-4 border-t border-zinc-800/50">
            <button 
              type="button" 
              onClick={() => setShowPrint(true)} 
              disabled={!fullDetails}
              className="px-4 py-2 text-xs font-medium bg-zinc-900 text-zinc-300 hover:text-white transition-colors rounded-md border border-zinc-800"
            >
              Preview Receipt
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors rounded-md text-xs font-medium disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
