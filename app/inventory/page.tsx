'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/src/components/AppLayout';
import AddInventoryModal from '@/src/components/modals/AddInventoryModal';
import EditInventoryModal from '@/src/components/modals/EditInventoryModal';
import { supabase } from '@/src/lib/supabase';
import { useSettingsStore } from '@/src/store/settings';

export default function Inventory() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useSettingsStore();

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('inventory').select('*').order('id', { ascending: false });
    if (data && !error) {
      setInventory(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <AppLayout
      headerAction={
        <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-zinc-100 hover:bg-white transition-colors text-zinc-900 rounded-md font-medium text-xs tracking-tight shadow-sm">
          + Add Inventory
        </button>
      }
    >
      <AddInventoryModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSuccess={fetchInventory} />
      <EditInventoryModal isOpen={isEditOpen} onClose={() => {setIsEditOpen(false); setSelectedItem(null);}} onSuccess={fetchInventory} item={selectedItem} />
      
      <div className="p-8 h-full overflow-y-auto">
        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-950/50">
            <h2 className="text-sm font-medium tracking-tight text-zinc-100">Inventory Items</h2>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/90 backdrop-blur-md">
                <tr className="border-b border-zinc-800/50 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  <th className="px-6 py-4 font-medium">SKU / Barcode</th>
                  <th className="px-6 py-4 font-medium">Product Name & Brand</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Cost Price</th>
                  <th className="px-6 py-4 font-medium">Selling Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500 text-xs">Loading inventory...</td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500 text-xs">No inventory items found</td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-zinc-300 font-mono text-xs">{item.sku || '-'}</div>
                        <div className="text-zinc-500 font-mono text-[10px] mt-0.5">{item.barcode || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-100 font-medium text-xs">{item.product_name}</div>
                        <div className="text-zinc-500 text-[10px] mt-0.5">{item.brand || '-'} {item.compatible ? `(${item.compatible})` : ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-300 text-xs">{item.category || '-'}</div>
                        <div className="text-zinc-500 text-[10px] mt-0.5">{item.subcategory || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        <div className="text-zinc-400">{formatCurrency(item.cost_price || 0)}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        <div className="text-emerald-400">{formatCurrency(item.selling_price || 0)}</div>
                      </td>
                      <td className={`px-6 py-4 text-xs font-mono ${item.stock <= 2 ? 'text-rose-400 font-medium' : 'text-zinc-400'}`}>
                        {item.stock}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">
                        {item.location_shelf || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setSelectedItem(item); setIsEditOpen(true); }} className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors border border-zinc-700">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
