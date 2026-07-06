'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import CurrencyInput from '@/src/components/CurrencyInput';

export default function EditQueueDetailsModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  order
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
  order: any;
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [problem, setProblem] = useState('');
  const [technician, setTechnician] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setCustomerName(order.customer_name || '');
      setCustomerPhone(order.customer_phone || '');
      setBrand(order.guitar_brand || '');
      setModel(order.guitar_model || '');
      setSerial(order.serial_number || '');
      setProblem(order.problem_description || '');
      setTechnician(order.technician || '');
      setPickupDate(order.pickup_date || '');
      setEstimatedFee(order.estimated_fee || 0);
    }
  }, [order]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from('workshop_queue').update({
      customer_name: customerName,
      customer_phone: customerPhone,
      guitar_brand: brand,
      guitar_model: model,
      serial_number: serial,
      problem_description: problem,
      technician: technician,
      pickup_date: pickupDate,
      estimated_fee: estimatedFee,
    }).eq('id', order.id);

    setLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    } else {
      alert("Error updating details: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-medium text-zinc-100 mb-6">Edit Service Details</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Customer Name</label>
              <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Customer Phone</label>
              <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Brand</label>
              <input required type="text" value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Model</label>
              <input required type="text" value={model} onChange={e => setModel(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Serial Number</label>
            <input type="text" value={serial} onChange={e => setSerial(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Problem Description</label>
            <textarea required rows={2} value={problem} onChange={e => setProblem(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Technician</label>
              <input type="text" value={technician} onChange={e => setTechnician(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Est. Pickup Date</label>
              <input required type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Est. Service Fee</label>
            <CurrencyInput value={estimatedFee} onChange={setEstimatedFee} />
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-zinc-100 text-zinc-900 hover:bg-white transition-colors rounded-md text-xs font-medium disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
