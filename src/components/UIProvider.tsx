'use client';

import { useUIStore } from '@/src/store/ui';
import { X } from 'lucide-react';

export default function UIProvider() {
  const { toasts, removeToast, confirmDialog, closeConfirm } = useUIStore();

  return (
    <>
      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`min-w-[300px] p-4 rounded-xl shadow-2xl flex justify-between items-center ${
              toast.type === 'success' ? 'bg-emerald-950 border border-emerald-900 text-emerald-400' :
              toast.type === 'error' ? 'bg-rose-950 border border-rose-900 text-rose-400' :
              'bg-zinc-900 border border-zinc-800 text-zinc-100'
            }`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-medium text-zinc-100 mb-2">Confirm Action</h3>
            <p className="text-sm text-zinc-400 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={closeConfirm}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
