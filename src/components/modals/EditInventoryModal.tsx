'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import CurrencyInput from '@/src/components/CurrencyInput';
import { useUIStore } from '@/src/store/ui';

export default function EditInventoryModal({ isOpen, onClose, onSuccess, item }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; item: any }) {
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [compatible, setCompatible] = useState('');
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [locationShelf, setLocationShelf] = useState('');
  const [supplier, setSupplier] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setSku(item.sku || '');
      setBarcode(item.barcode || '');
      setProductName(item.product_name || '');
      setCategory(item.category || '');
      setSubcategory(item.subcategory || '');
      setBrand(item.brand || '');
      setCompatible(item.compatible || '');
      setCostPrice(item.cost_price || 0);
      setSellingPrice(item.selling_price || 0);
      setStock(item.stock || 0);
      setLocationShelf(item.location_shelf || '');
      setSupplier(item.supplier || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('inventory').update({ 
      sku, barcode, product_name: productName, category, subcategory, brand, compatible, cost_price: costPrice, selling_price: sellingPrice, stock, location_shelf: locationShelf, supplier 
    }).eq('id', item.id);
    
    if (!error) {
      await supabase.from('audit_log').insert([{
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: 'Stock Updated',
        details: `${productName} updated`
      }]);
    }
    
    setLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    } else {
      addToast("Error updating inventory: " + error.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-3xl shadow-2xl mt-auto mb-auto">
        <h2 className="text-lg font-medium text-zinc-100 mb-6">Edit Inventory Item</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Product Name</label>
              <input required type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">SKU</label>
              <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Barcode</label>
              <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Brand</label>
              <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Subcategory</label>
              <input type="text" value={subcategory} onChange={e => setSubcategory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Compatible Devices/Guitars</label>
              <input type="text" value={compatible} onChange={e => setCompatible(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Supplier</label>
              <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 border-t border-zinc-800 pt-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Cost Price</label>
              <CurrencyInput value={costPrice} onChange={setCostPrice} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Selling Price</label>
              <CurrencyInput value={sellingPrice} onChange={setSellingPrice} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Stock</label>
              <input required type="number" min="0" value={stock} onChange={e => setStock(parseInt(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Location / Shelf</label>
              <input type="text" value={locationShelf} onChange={e => setLocationShelf(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
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
