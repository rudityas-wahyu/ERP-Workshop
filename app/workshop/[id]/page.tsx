'use client';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useSettingsStore } from '@/src/store/settings';
import CurrencyInput from '@/src/components/CurrencyInput';
import EditQueueDetailsModal from '@/src/components/modals/EditQueueDetailsModal';
import AppLayout from '@/src/components/AppLayout';
import { useRouter } from 'next/navigation';

export default function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  const [order, setOrder] = useState<any>(null);
  const [parts, setParts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const { formatCurrency, workshopName, workshopAddress, workshopPhone } = useSettingsStore();
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [amountPaid, setAmountPaid] = useState(0);
  const [showEditDetails, setShowEditDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, [orderId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: orderData } = await supabase.from('workshop_queue').select('*').eq('id', orderId).single();
    if (orderData) {
      setOrder(orderData);
            const { data: partsData } = await supabase.from('service_parts').select('*, inventory(*)').eq('service_id', orderId);
      setParts(partsData || []);
    }
    const { data: invData } = await supabase.from('inventory').select('*').gt('stock', 0);
    setInventory(invData || []);
    setLoading(false);
  };

  
    
  const addPart = async (inventoryId: number, price: number) => {
    const existing = parts.find(p => p.inventory_id === inventoryId);
    if (existing) {
      await supabase.from('service_parts').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('service_parts').insert([{
        service_id: orderId,
        inventory_id: inventoryId,
        quantity: 1,
        price_per_unit: price
      }]);
    }
    fetchData();
  };

  const updatePartQuantity = async (partId: number, delta: number) => {
    const part = parts.find(p => p.id === partId);
    if (!part) return;
    const newQ = part.quantity + delta;
    if (newQ > 0) {
      await supabase.from('service_parts').update({ quantity: newQ }).eq('id', partId);
    } else {
      await supabase.from('service_parts').delete().eq('id', partId);
    }
    fetchData();
  };

  const removePart = async (partId: number) => {
    await supabase.from('service_parts').delete().eq('id', partId);
    fetchData();
  };

  const partsTotal = parts.reduce((acc, part) => acc + (part.price_per_unit * part.quantity), 0);
  const subtotal = (order?.estimated_fee || 0) + partsTotal;
  
  const total = subtotal - discount + taxAmount;
  const changeAmount = amountPaid - total;

  const handleCheckout = async () => {
    if (amountPaid < total && paymentMethod === 'Cash') return alert('Insufficient amount paid');
    const { count } = await supabase.from('receipts').select('*', { count: 'exact', head: true }).like('receipt_id', 'REC-%');
    const nextId = (count || 0) + 1;
    const receipt_id = 'REC-' + nextId.toString().padStart(2, '0');
    
    // Save Receipt
    await supabase.from('receipts').insert([{
      service_id: orderId,
      receipt_id,
      subtotal,
      discount_amount: discount,
      tax_amount: taxAmount,
      total,
      payment_method: paymentMethod,
      amount_paid: amountPaid,
      change_amount: paymentMethod === 'Cash' ? changeAmount : 0
    }]);

    // Update Status
    await supabase.from('workshop_queue').update({ status: 'Done', final_fee: total }).eq('id', orderId);

    setReceiptId(receipt_id);
    setShowReceipt(true);
    setShowCheckout(false);
    router.push('/');
  };

  if (loading) return <AppLayout><div className="p-8 text-zinc-500">Loading order details...</div></AppLayout>;
  if (!order) return <AppLayout><div className="p-8 text-zinc-500">Order not found</div></AppLayout>;

  return (
    <AppLayout
      headerAction={
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors text-zinc-300 rounded-md font-medium text-xs tracking-tight shadow-sm">
          Back to Queue
        </button>
      }
    >
      <EditQueueDetailsModal 
        isOpen={showEditDetails} 
        onClose={() => setShowEditDetails(false)} 
        onSuccess={fetchData} 
        order={order} 
      />
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-zinc-100">{order.service_id}</h1>
            <p className="text-sm text-zinc-500 mt-1">{order.customer_name} • {order.guitar_brand} {order.guitar_model}</p>
          </div>
          <span className={`px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wider border ${
            order.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
            order.status === 'In Progress' ? 'bg-zinc-800 text-zinc-300 border-zinc-700/50' : 
            'bg-zinc-900 text-zinc-400 border-zinc-800'
          }`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-mono uppercase text-zinc-500 tracking-widest">Service Details</h2>
                <button onClick={() => setShowEditDetails(true)} className="text-[10px] uppercase font-medium tracking-wider text-emerald-400 hover:text-emerald-300">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500 mb-1">Problem Description</p>
                  <p className="text-zinc-200">{order.problem_description}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Technician</p>
                  <p className="text-zinc-200">{order.technician}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Serial Number</p>
                  <p className="text-zinc-200 font-mono text-xs">{order.serial_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Est. Pickup Date</p>
                  <p className="text-zinc-200 font-mono text-xs">{order.pickup_date || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-mono uppercase text-zinc-500 tracking-widest">Parts Used</h2>
                {order.status !== 'Done' && (
                  <select 
                    onChange={(e) => {
                      if(e.target.value) {
                        const inv = inventory.find(i => i.id === parseInt(e.target.value));
                        if(inv) addPart(inv.id, inv.selling_price);
                        e.target.value = "";
                      }
                    }}
                    className="bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-300 px-2 py-1 outline-none"
                  >
                    <option value="">+ Add Part...</option>
                    {inventory.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.product_name} - {formatCurrency(inv.selling_price)}</option>
                    ))}
                  </select>
                )}
              </div>
              
              {parts.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">No parts added yet.</p>
              ) : (
                <div className="space-y-2">
                  {parts.map(part => (
                    <div key={part.id} className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-2">
                      <div className="text-zinc-300 flex items-center gap-3">
                        <span>{part.inventory?.product_name || part.inventory?.item_name || 'Part'}</span>
                        {order.status !== 'Done' ? (
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
                        {order.status !== 'Done' && (
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
          <div className="space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-xs font-mono uppercase text-zinc-500 tracking-widest border-b border-zinc-800 pb-2 mb-4">Billing Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Est. Service Fee</span>
                  <span>{formatCurrency(order.estimated_fee)}</span>
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

              {order.status !== 'Done' && (
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
                <span className="font-medium">{order.service_id}</span>
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
