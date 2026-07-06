const fs = require('fs');
let content = fs.readFileSync('src/components/modals/CreateOrderModal.tsx', 'utf-8');

if (!content.includes('import CurrencyInput')) {
  content = content.replace(
    "import { useSettingsStore } from '@/src/store/settings';",
    "import { useSettingsStore } from '@/src/store/settings';\nimport CurrencyInput from '@/src/components/CurrencyInput';"
  );
  
  content = content.replace(
    /<div className="relative">\s*<span.*?<\/span>\s*<input.*?value=\{estimatedFee.*?\/>\s*<\/div>/s,
    `<CurrencyInput value={estimatedFee} onChange={setEstimatedFee} required />`
  );

  content = content.replace(
    /<div className="relative mt-1">\s*<span.*?<\/span>\s*<input.*?value=\{downPaymentAmount.*?\/>\s*<\/div>/s,
    `<div className="mt-1"><CurrencyInput value={downPaymentAmount} onChange={setDownPaymentAmount} /></div>`
  );

  fs.writeFileSync('src/components/modals/CreateOrderModal.tsx', content);
}
