'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useSettingsStore } from '@/src/store/settings';
import CurrencyInput from '@/src/components/CurrencyInput';

export default function RecordPastServiceModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [problem, setProblem] = useState('');
  const [technician, setTechnician] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [serviceFee, setServiceFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState(0);
  
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedParts, setSelectedParts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const { currency, formatCurrency } = useSettingsStore();

  useEffect(() => {
    if (isOpen) {
      const fetchInv = async () => {
        const { data } = await supabase.from('inventory').select('*').gt('stock', 0);
        setInventory(data || []);
      };
      fetchInv();
    } else {
      setCustomerName(''); setCustomerPhone(''); setBrand(''); setModel(''); setSerial('');
      setProblem(''); setTechnician(''); setServiceFee(0); setDiscount(0); setTax(0); 
      setAmountPaid(0); setSelectedParts([]);
    }
  }, [isOpen]);

  const addPart = (invId: number) => {
    const inv = inventory.find(i => i.id === invId);
    if (!inv) return;
    const existing = selectedParts.find(p => p.inventory_id === invId);
    if (existing) {
      setSelectedParts(selectedParts.map(p => p.inventory_id === invId ? { ...p, quantity: p.quantity + 1 } : p));
    } else {
      setSelectedParts([...selectedParts, { inventory_id: invId, quantity: 1, price_per_unit: inv.selling_price, product_name: inv.product_name }]);
    }
  };

  const removePart = (invId: number) => {
    setSelectedParts(selectedParts.filter(p => p.inventory_id !== invId));
  };

  const partsTotal = selectedParts.reduce((acc, part) => acc + (part.price_per_unit * part.quantity), 0);
  const total = serviceFee + partsTotal - discount + tax;
  const changeAmount = amountPaid - total;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'Cash' && amountPaid < total) return alert('Insufficient amount paid');
    setLoading(true);
    
    const { count } = await supabase.from('workshop_queue').select('*', { count: 'exact', head: true });
    const nextId = (count || 0) + 1;
    const service_id = 'GW-' + nextId.toString().padStart(2, '0');
    const { count: recCount } = await supabase.from('receipts').select('*', { count: 'exact', head: true }).like('receipt_id', 'REC-%');
    const receipt_id = 'REC-' + ((recCount || 0) + 1).toString().padStart(2, '0');
    
    // 1. Insert into workshop_queue
    const { data: orderData, error: orderError } = await supabase.from('workshop_queue').insert([{ 
      service_id, 
      customer_name: customerName, 
      customer_phone: customerPhone, 
      guitar_brand: brand, 
      guitar_model: model,
      serial_number: serial,
      problem_description: problem + ' (Historical Record)',
      status: 'Done',
      technician,
      has_down_payment: false,
      down_payment_amount: 0,
      estimated_fee: serviceFee,
      final_fee: total,
      pickup_date: completionDate,
      created_at: new Date(completionDate).toISOString(),
    }]).select().single();

    if (orderError) {
      alert("Error saving service order: " + orderError.message);
      setLoading(false);
      return;
    }

    // 2. Insert parts
    for (const part of selectedParts) {
      await supabase.from('service_parts').insert([{
        service_id: orderData.id,
        inventory_id: part.inventory_id,
        quantity: part.quantity,
        price_per_unit: part.price_per_unit
      }]);
      
      const inv = inventory.find(i => i.id === part.inventory_id);
      if (inv) {
        await supabase.from('inventory').update({ stock: inv.stock - part.quantity }).eq('id', part.inventory_id);
      }
    }

    // 3. Insert into receipts
    const { error: receiptError } = await supabase.from('receipts').insert([{
      receipt_id,
      service_id: orderData.id,
      subtotal: serviceFee + partsTotal,
      discount_amount: discount,
      tax_amount: tax,
      total,
      payment_method: paymentMethod,
      amount_paid: paymentMethod === 'Cash' ? amountPaid : total,
      change_amount: paymentMethod === 'Cash' ? changeAmount : 0,
      created_at: new Date(completionDate).toISOString()
    }]);

    setLoading(false);
    if (!receiptError) {
      onSuccess();
      onClose();
    } else {
      alert("Error saving receipt: " + receiptError.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-zinc-950 rounded-xl w-full max-w-2xl shadow-2xl border border-zinc-800 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">Record Past Service</h2>
          <p className="text-sm text-zinc-500 mt-1">Enter a completed historical service to update your database and financial records accurately.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-800 pb-2">Customer & Date</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Completion Date</label>
                  <input type="date" value={completionDate} onChange={e => setCompletionDate(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Customer Name</label>
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Phone Number</label>
                  <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-800 pb-2">Instrument Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Brand</label>
                  <input required type="text" value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Model</label>
                  <input required type="text" value={model} onChange={e => setModel(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Serial Number</label>
                  <input type="text" value={serial} onChange={e => setSerial(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Problem Description & Work Done</label>
                  <textarea required rows={3} value={problem} onChange={e => setProblem(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"></textarea>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Assigned Technician</label>
                  <input required type="text" value={technician} onChange={e => setTechnician(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-800 pb-2 flex justify-between items-center">
              <span>Parts Used</span>
              <select 
                onChange={(e) => {
                  if(e.target.value) {
                    addPart(parseInt(e.target.value));
                    e.target.value = "";
                  }
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-md text-xs px-2 py-1 outline-none text-zinc-300"
              >
                <option value="">+ Add Part...</option>
                {inventory.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.product_name} - {formatCurrency(inv.selling_price)}</option>
                ))}
              </select>
            </h3>
            {selectedParts.length > 0 ? (
              <div className="space-y-2">
                {selectedParts.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-2">
                    <span className="text-zinc-300">{p.product_name} <span className="text-zinc-500 ml-2">x{p.quantity}</span></span>
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-300">{formatCurrency(p.price_per_unit * p.quantity)}</span>
                      <button type="button" onClick={() => removePart(p.inventory_id)} className="text-rose-400 text-xs">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No parts added.</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-800 pb-2">Financials</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Service Fee</label>
                <CurrencyInput value={serviceFee} onChange={setServiceFee} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Discount</label>
                <CurrencyInput value={discount} onChange={setDiscount} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Tax</label>
                <CurrencyInput value={tax} onChange={setTax} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700">
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Transfer">Transfer</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
            </div>
            
            {paymentMethod === 'Cash' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="md:col-start-4">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Amount Paid</label>
                  <CurrencyInput value={amountPaid} onChange={setAmountPaid} required />
                </div>
              </div>
            )}

            <div className="flex flex-col items-end gap-2 border-t border-zinc-800 pt-4 mt-4">
              <div className="flex justify-end gap-4 text-xs text-zinc-400">
                <span>Total Revenue:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {paymentMethod === 'Cash' && amountPaid >= total && (
                <div className="flex justify-end gap-4 text-xs text-emerald-400">
                  <span>Change:</span>
                  <span>{formatCurrency(changeAmount)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-zinc-100 text-zinc-900 hover:bg-white transition-colors rounded-md text-xs font-medium disabled:opacity-50 shadow-sm">
              {loading ? 'Saving...' : 'Record Past Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
