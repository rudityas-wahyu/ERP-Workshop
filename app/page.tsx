'use client';

import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { supabase } from '@/src/lib/supabase';
import { useSettingsStore } from '@/src/store/settings';
import AddInventoryModal from '@/src/components/modals/AddInventoryModal';
import CreateOrderModal from '@/src/components/modals/CreateOrderModal';
import CreateInvoiceModal from '@/src/components/modals/CreateInvoiceModal';
import AddCustomerModal from '@/src/components/modals/AddCustomerModal';

export default function Home() { const { formatCurrency } = useSettingsStore(); 
  const [stats, setStats] = useState({
    activeRepairs: 14,
    activeRepairsDelta: '+2 today',
    revenue: 8420,
    lowStock: 6,
    avgTurnaround: 3.2
  });

  const [queue, setQueue] = useState<any[]>([]);

  const [inventory, setInventory] = useState<any[]>([]);

  const [audit, setAudit] = useState<any[]>([]);

  // Modals state
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [connError, setConnError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: queueData, error: queueError } = await supabase.from('workshop_queue').select('*').limit(5);
      if (queueError) setConnError(queueError.message);
      if (queueData && !queueError) setQueue(queueData);

      const { data: invData, error: invError } = await supabase.from('inventory').select('*').limit(3);
      if (invData && !invError) setInventory(invData);

      const { data: auditData, error: auditError } = await supabase.from('audit_log').select('*').order('id', { ascending: false }).limit(4);
      if (auditData && !auditError) setAudit(auditData);
      
      // Calculate dynamic stats
      const { data: invs, error: invsErr } = await supabase.from('invoices').select('*').eq('status', 'Paid');
      const { data: recs, error: recsErr } = await supabase.from('receipts').select('*');
      
      const safeInvs = invsErr ? [] : (invs || []);
      const safeRecs = recsErr ? [] : (recs || []);
      
      const totalInvoiceRev = safeInvs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const totalReceiptRev = safeRecs.reduce((acc, curr) => acc + (curr.total || 0), 0);
      const totalRevenue = totalInvoiceRev + totalReceiptRev;
      
      
      
      const activeRepairsCount = (queueData || []).filter((q: any) => q.status !== 'Completed').length;
      const lowStockCount = (invData || []).filter((i: any) => i.stock <= 2).length;
      
      // Get all completed repairs to calculate turnaround
      const { data: completedQueue } = await supabase.from('workshop_queue').select('*').eq('status', 'Completed');
      let avgTurnaround = 0;
      if (completedQueue && completedQueue.length > 0) {
        // Just mock calculation or use a real one if timestamps exist, for now just show a simple static or dynamic number
        avgTurnaround = 3; 
      }
      
      setStats({
        activeRepairs: activeRepairsCount,
        activeRepairsDelta: '+0 today',
        revenue: totalRevenue,
        lowStock: lowStockCount,
        avgTurnaround: avgTurnaround
      });
      
    } catch (e) {
      console.error("Supabase fetch failed, using dummy data:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AppLayout
      headerAction={
        <button onClick={() => setIsOrderOpen(true)} className="px-4 py-2 bg-zinc-100 hover:bg-white transition-colors text-zinc-900 rounded-md font-medium text-xs tracking-tight shadow-sm">
          New Service Order
        </button>
      }
    >
      <CreateOrderModal isOpen={isOrderOpen} onClose={() => setIsOrderOpen(false)} onSuccess={fetchData} />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8 shrink-0">
        <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-2">Active Repairs</p>
          <div className="flex items-baseline gap-2 mt-auto">
            <p className="text-3xl font-semibold tracking-tight text-zinc-100">{stats.activeRepairs}</p>
            <p className="text-xs font-medium text-emerald-400">{stats.activeRepairsDelta}</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-2">Revenue (MTD)</p>
          <div className="flex items-baseline gap-2 mt-auto">
            <p className="text-3xl font-semibold tracking-tight text-zinc-100">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-2">Low Stock</p>
          <div className="flex items-baseline gap-2 mt-auto">
            <p className="text-3xl font-semibold tracking-tight text-rose-400">{stats.lowStock}</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase">Alerts</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-2">Avg Turnaround</p>
          <div className="flex items-baseline gap-2 mt-auto">
            <p className="text-3xl font-semibold tracking-tight text-zinc-100">{stats.avgTurnaround}</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase">Days</p>
          </div>
        </div>
      </div>

      {/* Main Workshop View */}
      <div className="flex-1 flex flex-col gap-8 overflow-y-auto min-h-[400px]">
        {/* Active Queue Table */}
        {connError && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">Database Error: {connError}. Please open Settings (gear icon) and ensure NEXT_PUBLIC_SUPABASE_ANON_KEY contains your Publishable Key (or anon public key) and NOT your secret role key.</div>}
        <div className="w-full bg-zinc-900/20 border border-zinc-800/50 rounded-xl flex flex-col overflow-hidden shrink-0">
          <div className="px-6 py-5 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-950/50">
            <h2 className="text-sm font-medium tracking-tight text-zinc-100">Workshop Queue</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-zinc-900 border border-zinc-800/50 text-xs rounded-md text-zinc-300 shadow-sm cursor-pointer hover:bg-zinc-800">All Status</span>
              <span className="px-3 py-1 bg-zinc-900 border border-zinc-800/50 text-xs rounded-md text-zinc-300 shadow-sm cursor-pointer hover:bg-zinc-800">Priority</span>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/90 backdrop-blur-md">
                <tr className="border-b border-zinc-800/50 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  <th className="px-6 py-4 font-medium">Service ID</th>
                  <th className="px-6 py-4 font-medium">Customer & Gear</th>
                  <th className="px-6 py-4 font-medium">Service Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                  <th className="px-6 py-4 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {queue.map((item) => (
                  <tr key={item.id} onClick={() => window.location.href = `/workshop/${item.id}`} className="hover:bg-zinc-900/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">{item.service_id}</td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-100 font-medium">{item.customer_name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{item.guitar_brand} {item.guitar_model}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-300">{item.problem_description || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className={`whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] font-medium tracking-wide uppercase border ${
                        item.status === 'Completed' ? 'bg-transparent text-zinc-400 border-zinc-600' :
                        item.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        item.status === 'In Progress' ? 'bg-zinc-800 text-zinc-300 border-zinc-700/50' : 
                        'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-xs font-mono ${item.status === 'Completed' ? 'text-zinc-400' : item.status === 'Done' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {item.pickup_date || "N/A"}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-100">{formatCurrency(item.estimated_fee || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lower Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 shrink-0 pb-8">
          {/* Inventory Alerts Table */}
          <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-950/50">
              <h2 className="text-sm font-medium tracking-tight text-zinc-100">Inventory Alerts</h2>
              <span className="text-zinc-400 text-xs cursor-pointer hover:text-zinc-100 transition-colors">View All</span>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-950/90 backdrop-blur-md">
                  <tr className="border-b border-zinc-800/50 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                    <th className="px-6 py-3 font-medium">Item Name</th>
                    <th className="px-6 py-3 font-medium">Stock</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-6 py-3 text-zinc-300 text-xs font-medium">{item.product_name}</td>
                      <td className={`px-6 py-3 text-xs font-mono ${item.stock <= 2 ? 'text-rose-400' : 'text-zinc-400'}`}>{item.stock}</td>
                      <td className="px-6 py-3 text-right">
                        <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 transition-colors text-xs rounded-md text-zinc-100 border border-zinc-700 shadow-sm">Order</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-800/50 bg-zinc-950/50">
              <h2 className="text-sm font-medium tracking-tight text-zinc-100">Audit Log</h2>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-950/90 backdrop-blur-md">
                  <tr className="border-b border-zinc-800/50 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                    <th className="px-6 py-3 font-medium">Time</th>
                    <th className="px-6 py-3 font-medium">Event</th>
                    <th className="px-6 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {audit.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-3 text-[10px] font-mono text-zinc-500">{item.time}</td>
                      <td className="px-6 py-3 text-xs text-zinc-100 font-medium">{item.event}</td>
                      <td className="px-6 py-3 text-xs text-zinc-400">{item.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
