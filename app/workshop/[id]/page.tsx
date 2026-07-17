
'use client';

import { useState, useEffect, useCallback, use } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { supabase } from '@/src/lib/supabase';
import { useRouter } from 'next/navigation';
import EditQueueDetailsModal from '@/src/components/modals/EditQueueDetailsModal';
import CurrencyInput from '@/src/components/CurrencyInput';
import { Trash2 } from 'lucide-react';
import { useUIStore } from '@/src/store/ui';

export default function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { addToast, showConfirm } = useUIStore();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [parts, setParts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  // Add Part State
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);
  const [isAddingPart, setIsAddingPart] = useState(false);

  // Checkout State
  const [discount, setDiscount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [amountPaid, setAmountPaid] = useState(0);

  // Print Receipt Config
  const [workshopName, setWorkshopName] = useState('Guitar Workshop');
  const [workshopAddress, setWorkshopAddress] = useState('123 Music St.\nCity, Country');
  const [workshopPhone, setWorkshopPhone] = useState('+1 234 567 890');
  const [receiptId, setReceiptId] = useState('');

  const fetchData = useCallback(async (showLoader = false) => {
    if (!orderId) return;
    if (showLoader) setLoading(true);
    const { data: orderData, error: orderErr } = await supabase.from('workshop_queue').select('*').eq('id', orderId).single();
    const { data: rawPartsData, error: partsErr } = await supabase.from('service_parts').select('*').eq('service_id', orderId);
    console.log('rawPartsData fetched:', rawPartsData, 'for orderId:', orderId);
    if (partsErr) {
      console.error('parts err:', partsErr);
      addToast('Parts fetch error: ' + partsErr.message, 'error');
    }
    const { data: invData } = await supabase.from('inventory').select('*').order('product_name', { ascending: true });

    if (orderData) {
      setOrder(orderData);
    } else if (orderErr) {
      console.error(orderErr);
    }

    if (rawPartsData && invData) {
      const partsWithInv = rawPartsData.map(p => ({
        ...p,
        inventory: invData.find(i => i.id === p.inventory_id)
      }));
      console.log('setting parts with inv:', partsWithInv);
      setParts(partsWithInv);
    } else if (rawPartsData) {
      setParts(rawPartsData);
    }
    if (invData) setInventory(invData);

    const { data: settings } = await supabase.from('settings').select('*');
    if (settings) {
      settings.forEach(s => {
        if (s.key === 'workshop_name') setWorkshopName(s.value);
        if (s.key === 'workshop_address') setWorkshopAddress(s.value);
        if (s.key === 'workshop_phone') setWorkshopPhone(s.value);
      });
    }

    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const addPart = async () => {
    if (!selectedPartId || partQuantity < 1) return;
    setIsAddingPart(true);

    const selectedInv = inventory.find(i => i.id.toString() === selectedPartId.toString());
    if (!selectedInv) { setIsAddingPart(false); return; }

    const price = selectedInv.selling_price || 0;

    console.log('Inserting part:', { service_id: parseInt(orderId as string, 10), inventory_id: parseInt(selectedPartId as string, 10), quantity: partQuantity, price_per_unit: price });
    const { error, data: insertedData } = await supabase.from('service_parts').insert({

      service_id: parseInt(orderId as string, 10),
      inventory_id: parseInt(selectedPartId as string, 10),
      quantity: partQuantity,
      price_per_unit: price
    });
    if (error) {
      console.error(error);
      addToast('Error adding part: ' + error.message, 'error');
    }

    setPartQuantity(1);
    setSelectedPartId('');
    setIsAddingPart(false);
    fetchData();
  };

  const removePart = async (partId: any) => {
    await supabase.from('service_parts').delete().eq('id', partId);
    fetchData();
  };

  const updatePartQuantity = async (partId: any, delta: number) => {
    const part = parts.find(p => p.id === partId);
    if (!part) return;
    const newQuantity = part.quantity + delta;
    if (newQuantity < 1) {
      removePart(partId);
      return;
    }
    await supabase.from('service_parts').update({ quantity: newQuantity }).eq('id', partId);
    fetchData();
  };

  const handleCheckout = async () => {
    const newReceiptId = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    setReceiptId(newReceiptId);

    const partsTotal = parts.reduce((acc, p) => acc + (p.price_per_unit * p.quantity), 0);
    const subtotal = (order.estimated_fee || 0) + partsTotal - (order.has_down_payment ? order.down_payment_amount : 0);
    const total = subtotal - discount + taxAmount;

    // Deduct inventory
    for (const part of parts) {
      const inv = inventory.find(i => i.id === part.inventory_id);
      if (inv) {
        await supabase.from('inventory').update({ stock: Math.max(0, inv.stock - part.quantity) }).eq('id', inv.id);
      }
    }

    // Save transaction
    await supabase.from('transactions').insert({
      type: 'receipt',
      category: 'workshop',
      amount: total,
      description: `Workshop Receipt ${newReceiptId} - ${order.service_id}`,
      payment_method: paymentMethod
    });

    // Update Status
    await supabase.from('workshop_queue').update({ status: 'Completed', final_fee: total }).eq('id', orderId);
    
    setShowCheckout(false);
    setShowReceipt(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20 text-zinc-500">Loading...</div></AppLayout>;
  if (!order) return <AppLayout><div className="flex justify-center py-20 text-zinc-500">Order not found</div></AppLayout>;

  const partsTotal = parts.reduce((acc, p) => acc + (p.price_per_unit * p.quantity), 0);
  const downPayment = order.has_down_payment ? order.down_payment_amount : 0;
  const subtotal = (order.estimated_fee || 0) + partsTotal - downPayment;
  const total = subtotal - discount + taxAmount;
  const changeAmount = amountPaid - total;

  return (
    <AppLayout>
      <EditQueueDetailsModal 
        isOpen={showEditDetails} 
        onClose={() => setShowEditDetails(false)} 
        onSuccess={fetchData} 
        order={order} 
      />
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex justify-between items-start">
          <div>
            <button onClick={() => router.push('/')} className="mb-4 text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors">
              &larr; Back to Dashboard
            </button>
            <h1 className="text-2xl font-medium tracking-tight text-zinc-100">{order.service_id}</h1>
            <p className="text-sm text-zinc-500 mt-1">{order.customer_name} • {order.guitar_brand} {order.guitar_model}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={async () => {
                showConfirm('Are you sure you want to delete this workshop order?', async () => {
                  await supabase.from('workshop_queue').delete().eq('id', orderId);
                  router.push('/');
                })
              }}
              className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-md transition-colors"
              title="Delete Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <select
              value={order.status}
              onChange={async (e) => {
                const newStatus = e.target.value;
                await supabase.from('workshop_queue').update({ status: newStatus }).eq('id', orderId);
                fetchData();
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider border outline-none cursor-pointer transition-colors ${
                order.status === 'Completed' ? 'bg-transparent text-zinc-400 border-zinc-600' : 
                order.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 
                order.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 
                'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              <option value="Queued" className="bg-zinc-900 text-zinc-300">QUEUED</option>
              <option value="In Progress" className="bg-zinc-900 text-zinc-300">IN PROGRESS</option>
              <option value="Done" className="bg-zinc-900 text-zinc-300">DONE</option>
              <option value="Completed" className="bg-zinc-900 text-zinc-300">COMPLETED</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Order Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-mono uppercase text-zinc-500 tracking-widest">Service Details</h2>
                {order.status !== 'Completed' && (
                  <button onClick={() => setShowEditDetails(true)} className="text-[10px] uppercase font-medium tracking-wider text-emerald-400 hover:text-emerald-300">Edit</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500 mb-1">Problem Description</p>
                  <p className="text-zinc-200">{order.problem_description || "N/A"}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Technician</p>
                  <p className="text-zinc-200">{order.technician || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Serial Number</p>
                  <p className="text-zinc-200">{order.serial_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Est. Pickup Date</p>
                  <p className="text-zinc-200 font-mono text-xs mt-1.5">{order.pickup_date || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Parts Used */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6">
              <h2 className="text-xs font-mono uppercase text-zinc-500 tracking-widest mb-4">Parts Used</h2>
              
              {order.status !== 'Completed' && (
                <div className="flex gap-2 mb-6">
                  <select 
                    value={selectedPartId} 
                    onChange={e => setSelectedPartId(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  >
                    <option value="">Select Part from Inventory...</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.id} disabled={item.stock < 1}>
                        {item.product_name || item.item_name} - {formatCurrency(item.selling_price || 0)} | {item.stock} left
                      </option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    min="1"
                    value={partQuantity}
                    onChange={e => setPartQuantity(parseInt(e.target.value) || 1)}
                    className="w-20 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  />
                  <button 
                    onClick={addPart}
                    disabled={isAddingPart || !selectedPartId}
                    className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Part
                  </button>
                </div>
              )}

              {parts.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">No parts added yet.</p>
              ) : (
                <div className="space-y-2">
                  {parts.map(part => (
                    <div key={part.id} className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-2">
                      <div className="text-zinc-300 flex items-center gap-3">
                        <span>{part.inventory?.product_name || part.inventory?.item_name || 'Part'}</span>
                        {order.status !== 'Completed' ? (
                          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded">
                            <button onClick={() => updatePartQuantity(part.id, -1)} className="w-5 h-5 flex justify-center items-center text-zinc-400 hover:text-white">-</button>
                            <span className="text-xs w-4 text-center">{part.quantity}</span>
                            <button onClick={() => updatePartQuantity(part.id, 1)} className="w-5 h-5 flex justify-center items-center text-zinc-400 hover:text-white">+</button>
                          </div>
                        ) : (
                           <span className="text-zinc-500 text-xs">x{part.quantity}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-300 font-medium">{formatCurrency(part.price_per_unit * part.quantity)}</span>
                        {order.status !== 'Completed' && (
                          <button onClick={() => removePart(part.id)} className="text-rose-400 hover:text-rose-300 text-xs">Remove</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Billing & Checkout */}
          <div className="md:col-span-1">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 sticky top-6">
              <h2 className="text-xs font-mono uppercase text-zinc-500 tracking-widest mb-6">Billing Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-300">
                  <span>Est. Service Fee</span>
                  <span>{formatCurrency(order.estimated_fee || 0)}</span>
                </div>
                
                <div className="flex justify-between text-zinc-400">
                  <span>Parts Total</span>
                  <span>{formatCurrency(partsTotal)}</span>
                </div>

                {order.has_down_payment && (
                  <div className="flex justify-between text-emerald-400/80">
                    <span>Down Payment</span>
                    <span>-{formatCurrency(order.down_payment_amount)}</span>
                  </div>
                )}
                
                <div className="border-t border-zinc-800 my-2 pt-2"></div>
                
                <div className="flex justify-between text-zinc-300 font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>

              {order.status !== 'Completed' && (
                <button 
                  onClick={() => setShowCheckout(true)}
                  className="w-full mt-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  Complete Order & Checkout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-medium text-zinc-100 mb-6">Checkout Process</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm text-zinc-300">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Discount Amount</span>
                <div className="w-28"><CurrencyInput value={discount} onChange={setDiscount} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-100 outline-none focus:border-zinc-700 pl-6 text-right" /></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Tax</span>
                <div className="w-28"><CurrencyInput value={taxAmount} onChange={setTaxAmount} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-right text-zinc-100 outline-none focus:border-zinc-700 pl-6" /></div>
              </div>

              <div className="border-t border-zinc-800 pt-3 flex justify-between text-lg font-medium text-zinc-100">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-800 pb-2">Payment</h3>
              <div className="grid grid-cols-3 gap-2">
                {['QRIS', 'Transfer', 'Cash'].map(method => (
                  <button 
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 text-xs font-medium rounded-md border ${
                      paymentMethod === method 
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {paymentMethod === 'Cash' && (
                <div className="pt-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Amount Given</label>
                  <CurrencyInput value={amountPaid} onChange={setAmountPaid} className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-8 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
                  <div className="flex justify-between text-sm mt-2 text-emerald-400">
                    <span>Change</span>
                    <span>{formatCurrency(Math.max(0, changeAmount))}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowCheckout(false)} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100">Cancel</button>
              <button 
                onClick={handleCheckout} 
                disabled={paymentMethod === 'Cash' && amountPaid < total}
                className="px-6 py-2 bg-zinc-100 text-zinc-900 hover:bg-white rounded-md text-xs font-medium disabled:opacity-50"
              >
                Confirm & Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      {showReceipt && (
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
                <span className="font-mono font-medium">{receiptId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Date:</span>
                <span className="font-mono">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Customer:</span>
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Service:</span>
                <div className="text-right max-w-[200px]">
                  <div className="font-medium">{order.service_id}</div>
                  <div className="text-zinc-500 text-[10px] font-normal mt-0.5">{order.guitar_brand} {order.guitar_model} | {order.problem_description}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-b border-zinc-200 py-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Service Fee</span>
                <span>{formatCurrency(order.estimated_fee)}</span>
              </div>
              {parts.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Parts ({parts.length})</span>
                  <span>{formatCurrency(partsTotal)}</span>
                </div>
              )}
              {order.has_down_payment && (
                <div className="flex justify-between text-sm">
                  <span>Down Payment</span>
                  <span>-{formatCurrency(order.down_payment_amount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            </div>
            
            <div className="flex justify-between text-lg font-bold mb-2">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Payment Method</span>
              <span>{paymentMethod}</span>
            </div>
            
            {paymentMethod === 'Cash' && (
              <>
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Amount Given</span>
                  <span>{formatCurrency(amountPaid)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mb-6">
                  <span>Change</span>
                  <span>{formatCurrency(Math.max(0, changeAmount))}</span>
                </div>
              </>
            )}

            <div className="text-center text-xs text-zinc-400 mt-8 mb-6">
              Thank you for choosing {workshopName || 'Guitar Workshop'}!
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowReceipt(false); fetchData(); }} className="flex-1 py-2 text-sm font-medium text-zinc-500 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors">Close</button>
              <button onClick={() => window.print()} className="flex-1 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors">Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
