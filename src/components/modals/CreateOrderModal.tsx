'use client';
import { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useSettingsStore } from '@/src/store/settings';
import CurrencyInput from '@/src/components/CurrencyInput';
import { useUIStore } from '@/src/store/ui';

export default function CreateOrderModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [problem, setProblem] = useState('');
  const [technician, setTechnician] = useState('');
  const [hasDownPayment, setHasDownPayment] = useState(false);
  const [downPaymentAmount, setDownPaymentAmount] = useState(0);
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [pickupDate, setPickupDate] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { currency } = useSettingsStore();
  const getCurrencySymbol = () => currency === 'IDR' ? 'Rp' : currency === 'EUR' ? '€' : '$';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { count } = await supabase.from('workshop_queue').select('*', { count: 'exact', head: true });
    const nextId = (count || 0) + 1;
    const service_id = 'GW-' + nextId.toString().padStart(2, '0');
    
    const { error } = await supabase.from('workshop_queue').insert([{ 
      service_id, 
      customer_name: customerName, 
      customer_phone: customerPhone, 
      guitar_brand: brand, 
      guitar_model: model,
      serial_number: serial,
      problem_description: problem,
      status: 'Queued',
      technician,
      has_down_payment: hasDownPayment,
      down_payment_amount: hasDownPayment ? downPaymentAmount : 0,
      estimated_fee: estimatedFee,
      pickup_date: pickupDate,
      created_at: new Date(createdAt).toISOString(),
    }]);
    
    setLoading(false);
    if (!error) {
      setCustomerName(''); setCustomerPhone(''); setBrand(''); setModel(''); setSerial(''); setProblem(''); setTechnician(''); setHasDownPayment(false); setDownPaymentAmount(0); setEstimatedFee(0); setPickupDate('');
      onSuccess();
      onClose();
    } else {
      addToast("Error creating order: " + error.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl mt-auto mb-auto">
        <h2 className="text-lg font-medium text-zinc-100 mb-6">New Service Order</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-800 pb-2">Customer Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Order Date</label>
                <input required type="date" value={createdAt} onChange={e => setCreatedAt(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Customer Name</label>
                <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Phone Number</label>
                <input required type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-800 pb-2">Instrument Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Brand</label>
                <input required type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Fender" className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Model</label>
                <input required type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="Stratocaster" className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Serial Number (Opt)</label>
                <input type="text" value={serial} onChange={e => setSerial(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Problem Description</label>
              <textarea required rows={3} value={problem} onChange={e => setProblem(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-800 pb-2">Service Terms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Assigned Technician</label>
                <input required type="text" value={technician} onChange={e => setTechnician(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Est. Pickup Date</label>
                <input type="date" required value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Estimated Service Fee</label>
                <CurrencyInput value={estimatedFee} onChange={setEstimatedFee} required />
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 mt-5">
                  <input type="checkbox" checked={hasDownPayment} onChange={e => setHasDownPayment(e.target.checked)} className="rounded border-zinc-800 bg-zinc-900 text-zinc-100" />
                  Include Down Payment
                </label>
                {hasDownPayment && (
                  <div className="mt-1"><CurrencyInput value={downPaymentAmount} onChange={setDownPaymentAmount} /></div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-zinc-100 text-zinc-900 hover:bg-white transition-colors rounded-md text-xs font-medium disabled:opacity-50 shadow-sm">
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
