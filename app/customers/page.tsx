'use client';
import { useState } from 'react';
import AppLayout from '@/src/components/AppLayout';
import AddCustomerModal from '@/src/components/modals/AddCustomerModal';

export default function Customers() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AppLayout
      headerAction={
        <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-zinc-100 hover:bg-white transition-colors text-zinc-900 rounded-md font-medium text-xs tracking-tight shadow-sm">
          + Add Customer
        </button>
      }
    >
      <AddCustomerModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSuccess={() => {}} />
      <div className="flex items-center justify-center h-full text-zinc-500">
        Customers Module
      </div>
    </AppLayout>
  );
}
