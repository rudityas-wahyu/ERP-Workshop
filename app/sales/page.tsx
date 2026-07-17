'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { supabase } from '@/src/lib/supabase';
import { useSettingsStore } from '@/src/store/settings';
import CurrencyInput from '@/src/components/CurrencyInput';
import { Search, Trash2 } from 'lucide-react';
import { useUIStore } from '@/src/store/ui';

export default function Sales() {
  const { addToast } = useUIStore();
  const [inventory, setInventory] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency, workshopName, workshopAddress, workshopPhone } = useSettingsStore();
  
  // Checkout
  const [showCheckout, setShowCheckout] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [amountPaid, setAmountPaid] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Receipt
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  
  // Custom Item Modal
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('inventory').select('*').gt('stock', 0);
    setInventory(data || []);
    setLoading(false);
  };

  
  const handleAddCustomItem = () => {
    if (!customName || customPrice <= 0) return;
    setCart([...cart, {
      id: 'custom-' + Date.now(),
      product_name: customName,
      selling_price: customPrice,
      quantity: 1,
      stock: 999
    }]);
    setCustomName('');
    setCustomPrice(0);
    setShowCustomItem(false);
  };

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      if (existing.quantity >= item.stock) return;
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: any, delta: number) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQ = c.quantity + delta;
        if (newQ > 0 && newQ <= c.stock) {
          return { ...c, quantity: newQ };
        }
      }
      return c;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.selling_price * item.quantity), 0);
  
  const total = subtotal - discount + taxAmount;
  const changeAmount = amountPaid - total;

  const handleCheckout = async () => {
    if (amountPaid < total && paymentMethod === 'Cash') return addToast('Insufficient amount paid', 'info');
    
    const { count } = await supabase.from('receipts').select('*', { count: 'exact', head: true }).like('receipt_id', 'POS-%');
    const receipt_id = 'POS-' + ((count || 0) + 1).toString().padStart(2, '0');
    
    // Save Receipt
    const { data: recData, error } = await supabase.from('receipts').insert([{
      receipt_id,
      subtotal,
      discount_amount: discount,
      tax_amount: taxAmount,
      total,
      payment_method: customerName ? `${paymentMethod}|${customerName}` : paymentMethod,
      amount_paid: amountPaid,
      change_amount: paymentMethod === 'Cash' ? changeAmount : 0
    }]).select().single();

    if (error) {
      addToast("Checkout failed: " + error.message, 'error');
      return;
    }

    // Deduct inventory
    for (const item of cart) {
      if (typeof item.id === 'number') {
        await supabase.from('inventory').update({
          stock: item.stock - item.quantity
        }).eq('id', item.id);
      }
    }

    setReceiptData({
      receipt_id,
      date: new Date().toLocaleString(),
      cart,
      subtotal,
      discount,
      taxAmount,
      total,
      paymentMethod,
      amountPaid,
      changeAmount
    });
    
    setShowReceipt(true);
    setShowCheckout(false);
  };

  const finishTransaction = () => {
    setCart([]);
    setDiscount(0);
    setTaxAmount(0);
    setAmountPaid(0);
    setShowReceipt(false);
    fetchData();
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col md:flex-row gap-6 pb-6">
        {/* Inventory List */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="mb-4">
            <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Point of Sale</h1>
            <p className="text-sm text-zinc-500 mt-1">Select items to add to cart.</p>
          </div>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
            <button onClick={() => setShowCustomItem(true)} className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors whitespace-nowrap">
              + Add Custom Item
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
              {loading ? (
                <div className="col-span-full text-zinc-500">Loading inventory...</div>
              ) : inventory.filter(item => (item?.product_name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || (item?.sku || '').toLowerCase().includes((searchQuery || '').toLowerCase())).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => addToCart(item)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-medium text-zinc-100 line-clamp-2 leading-tight">{item.product_name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{item.sku}</p>
                  </div>
                  <div className="mt-4 flex flex-col items-start gap-0.5">
                    <span className="text-lg font-semibold text-emerald-400">{formatCurrency(item.selling_price)}</span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Stock: {item.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-full md:w-96 bg-zinc-900/50 border border-zinc-800/80 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/80">
            <h2 className="font-medium text-zinc-100 flex justify-between">
              <span>Current Order</span>
              <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs">{cart.length} items</span>
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center text-zinc-500 text-sm mt-12">Cart is empty.</div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{item.product_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center bg-zinc-800 rounded text-zinc-400 hover:text-white">-</button>
                      <span className="text-xs text-zinc-300 w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center bg-zinc-800 rounded text-zinc-400 hover:text-white">+</button>
                      <span className="text-xs text-zinc-500 ml-2">@ {formatCurrency(item.selling_price)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-300">{formatCurrency(item.selling_price * item.quantity)}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-zinc-500 hover:text-rose-400 transition-colors mt-1 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-3">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="border-t border-zinc-900 pt-3 flex justify-between text-lg font-medium text-zinc-100">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <button onClick={() => setShowCheckout(true)} className="w-full py-3 mt-2 bg-emerald-500 text-zinc-950 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors">
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-medium text-zinc-100 mb-6">Checkout</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm text-zinc-300">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Discount Amount</span>
                <div className="w-28"><CurrencyInput value={discount} onChange={setDiscount} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-right text-zinc-100 outline-none focus:border-zinc-700 pl-6" /></div>
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
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      {showReceipt && receiptData && (
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
                <span className="font-mono font-medium">{receiptData.receipt_id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Date:</span>
                <span className="font-mono">{receiptData.date}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Type:</span>
                <span className="font-medium">Retail Sale</span>
              </div>
              {customerName && (
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Customer:</span>
                  <span className="font-medium">{customerName}</span>
                </div>
              )}
            </div>

            <div className="border-t border-b border-zinc-200 py-4 mb-4 space-y-2">
              {receiptData.cart.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.product_name} (x{item.quantity})</span>
                  <span>{formatCurrency(item.selling_price * item.quantity)}</span>
                </div>
              ))}
              
              <div className="pt-2 mt-2 border-t border-dashed border-zinc-200">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(receiptData.subtotal)}</span>
                </div>
                {receiptData.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discount</span>
                    <span>-{formatCurrency(receiptData.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(receiptData.taxAmount)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-lg font-bold mb-2">
              <span>Total</span>
              <span>{formatCurrency(receiptData.total)}</span>
            </div>
            
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Payment Method</span>
              <span>{receiptData.paymentMethod}</span>
            </div>
            
            {receiptData.paymentMethod === 'Cash' && (
              <>
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Amount Given</span>
                  <span>{formatCurrency(receiptData.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mb-6">
                  <span>Change</span>
                  <span>{formatCurrency(receiptData.changeAmount)}</span>
                </div>
              </>
            )}

            <div className="text-center text-xs text-zinc-400 mt-8 mb-6">
              Thank you for shopping at {workshopName || 'Guitar Workshop'}!
            </div>

            <div className="flex gap-3">
              <button onClick={finishTransaction} className="flex-1 py-2 text-sm font-medium text-zinc-500 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors">Close</button>
              <button onClick={() => window.print()} className="flex-1 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors">Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    
      {/* Custom Item Modal */}
      {showCustomItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-medium text-zinc-100 mb-4">Add Custom Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Item Name</label>
                <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Price</label>
                <CurrencyInput value={customPrice} onChange={setCustomPrice} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCustomItem(false)} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100">Cancel</button>
                <button onClick={handleAddCustomItem} className="px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-white rounded-md text-xs font-medium">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}
