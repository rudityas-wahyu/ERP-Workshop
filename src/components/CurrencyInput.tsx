'use client';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/src/store/settings';

export default function CurrencyInput({
  value,
  onChange,
  className = "w-full bg-zinc-900 border border-zinc-800 rounded-md pl-8 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700",
  placeholder,
  required
}: {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const { currency } = useSettingsStore();
  const getCurrencySymbol = () => currency === 'IDR' ? 'Rp' : currency === 'EUR' ? '€' : '$';
  
  const [displayValue, setDisplayValue] = useState(value === 0 ? '' : value.toString());

  useEffect(() => {
    if (value !== undefined && value.toString() !== displayValue.replace(/\\D/g, '')) {
      setDisplayValue(value === 0 ? '' : value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\\D/g, '');
    setDisplayValue(raw);
    onChange(Number(raw));
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
        {getCurrencySymbol()}
      </span>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={className}
      />
    </div>
  );
}
