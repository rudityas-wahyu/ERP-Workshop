const fs = require('fs');
let content = fs.readFileSync('src/components/modals/RecordPastServiceModal.tsx', 'utf-8');

if (!content.includes('import CurrencyInput')) {
  content = content.replace(
    "import { useSettingsStore } from '@/src/store/settings';",
    "import { useSettingsStore } from '@/src/store/settings';\nimport CurrencyInput from '@/src/components/CurrencyInput';"
  );
  
  content = content.replace(
    /<div className="relative">\s*<span.*?<\/span>\s*<input.*?value=\{serviceFee.*?\/>\s*<\/div>/s,
    `<CurrencyInput value={serviceFee} onChange={setServiceFee} required />`
  );

  content = content.replace(
    /<div className="relative">\s*<span.*?<\/span>\s*<input.*?value=\{partsTotal.*?\/>\s*<\/div>/s,
    `<CurrencyInput value={partsTotal} onChange={setPartsTotal} required />`
  );

  content = content.replace(
    /<div className="relative">\s*<span.*?<\/span>\s*<input.*?value=\{discount.*?\/>\s*<\/div>/s,
    `<CurrencyInput value={discount} onChange={setDiscount} required />`
  );

  content = content.replace(
    /<div className="relative">\s*<span.*?<\/span>\s*<input.*?value=\{tax.*?\/>\s*<\/div>/s,
    `<CurrencyInput value={tax} onChange={setTax} required />`
  );

  fs.writeFileSync('src/components/modals/RecordPastServiceModal.tsx', content);
}
