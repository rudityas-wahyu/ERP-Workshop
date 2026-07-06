const fs = require('fs');

let content = fs.readFileSync('app/finance/page.tsx', 'utf-8');

if (!content.includes('getCurrencySymbol')) {
  content = content.replace(
    "const { formatCurrency } = useSettingsStore();",
    "const { currency, formatCurrency } = useSettingsStore();\n  const getCurrencySymbol = () => currency === 'IDR' ? 'Rp' : currency === 'EUR' ? '€' : '$';"
  );
  
  content = content.replace(/Amount \(\$ base value\)/, "Amount");
  
  const makeInput = (val, setVal) => `
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">{getCurrencySymbol()}</span>
                  <input required type="number" step="0.01" min="0" value={${val} || ''} onChange={e => ${setVal}(parseFloat(e.target.value) || 0)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-8 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>`;
                
  content = content.replace(/<input required type="number".*?value={manualAmount}.*?\/>/, makeInput('manualAmount', 'setManualAmount'));

  fs.writeFileSync('app/finance/page.tsx', content);
}
