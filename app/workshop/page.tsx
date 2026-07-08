'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { supabase } from '@/src/lib/supabase';
import { useSettingsStore } from '@/src/store/settings';
import { Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function WorkshopQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { formatCurrency } = useSettingsStore();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterMonth, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('workshop_queue').select('*').order('created_at', { ascending: false });
    if (data && !error) {
      setQueue(data);
    }
    setLoading(false);
  };

  const availableMonths = Array.from(new Set(queue.map(q => {
    const d = new Date(q.created_at);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }))).sort().reverse();

  const filteredQueue = queue.filter(q => {
    const d = new Date(q.created_at);
    const qMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const matchMonth = filterMonth === 'all' || qMonth === filterMonth;
    const matchStatus = filterStatus === 'all' || q.status === filterStatus;
    return matchMonth && matchStatus;
  }).sort((a, b) => {
    // Newest first, completed at the bottom
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (b.status === 'Completed' && a.status !== 'Completed') return -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.ceil(filteredQueue.length / ITEMS_PER_PAGE) || 1;
  const paginatedQueue = filteredQueue.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const formatMonth = (m: string) => {
    if (m === 'all') return 'All Time';
    const [year, month] = m.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <AppLayout>
      <div className="w-full px-4 space-y-6 pb-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-zinc-100">All Workshop Queue</h1>
            <p className="text-sm text-zinc-500 mt-1">Full history and management of service orders.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-transparent text-xs text-zinc-300 outline-none border border-zinc-800 rounded px-2 py-1 cursor-pointer">
                <option value="all" className="bg-zinc-900">All Status</option>
                <option value="Pending" className="bg-zinc-900">Pending</option>
                <option value="In Progress" className="bg-zinc-900">In Progress</option>
                <option value="Completed" className="bg-zinc-900">Completed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="bg-transparent text-xs text-zinc-300 outline-none border border-zinc-800 rounded px-2 py-1 cursor-pointer">
                <option value="all" className="bg-zinc-900">All Periods</option>
                {availableMonths.map(m => (
                  <option key={m} value={m} className="bg-zinc-900">{formatMonth(m)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Service ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Customer & Gear</th>
                  <th className="px-6 py-4 font-medium">Service Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                  <th className="px-6 py-4 font-medium text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">Loading queue...</td>
                  </tr>
                ) : filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">No service orders found.</td>
                  </tr>
                ) : (
                  paginatedQueue.map((item) => (
                    <tr key={item.id} onClick={() => window.location.href = `/workshop/${item.id}`} className="hover:bg-zinc-800/20 transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">{item.service_id}</td>
                      <td className="px-6 py-4 text-xs text-zinc-400">{new Date(item.created_at).toLocaleDateString()}</td>
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
                          'bg-transparent text-zinc-400 border-zinc-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-zinc-500">{item.pickup_date || "Not set"}</td>
                      <td className="px-6 py-4 text-right font-medium text-zinc-100">{formatCurrency(item.estimated_fee || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-zinc-800/50 flex items-center justify-between bg-zinc-950/30">
              <div className="text-xs text-zinc-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredQueue.length)} of {filteredQueue.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-zinc-300 font-medium px-2">{currentPage} / {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
