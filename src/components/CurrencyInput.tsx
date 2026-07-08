'use client';
import { useSettingsStore } from '@/src/store/settings';
import CurrencyInputField from 'react-currency-input-field';

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
  
  const decimalSeparator = currency === 'IDR' ? ',' : '.';
  const groupSeparator = currency === 'IDR' ? '.' : ',';

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium z-10 pointer-events-none">
        {getCurrencySymbol()}
      </span>
      <CurrencyInputField
        value={value === 0 ? '' : value}
        onValueChange={(val, name, values) => {
          onChange(values?.float || 0);
        }}
        decimalSeparator={decimalSeparator}
        groupSeparator={groupSeparator}
        decimalsLimit={currency === 'IDR' ? 0 : 2}
        placeholder={placeholder}
        required={required}
        className={className}
      />
    </div>
  );
}
