const fs = require('fs');

const filesToFix = [
  {
    path: 'src/components/modals/AddInventoryModal.tsx',
    replacements: [
      {
        find: /<input required type="number" step="0.01" min="0" value=\{costPrice\}.*?\/>/s,
        replace: `<CurrencyInput value={costPrice} onChange={setCostPrice} required />`
      },
      {
        find: /<input required type="number" step="0.01" min="0" value=\{sellingPrice\}.*?\/>/s,
        replace: `<CurrencyInput value={sellingPrice} onChange={setSellingPrice} required />`
      }
    ]
  },
  {
    path: 'src/components/modals/EditInventoryModal.tsx',
    replacements: [
      {
        find: /<input required type="number" step="0.01" min="0" value=\{costPrice\}.*?\/>/s,
        replace: `<CurrencyInput value={costPrice} onChange={setCostPrice} required />`
      },
      {
        find: /<input required type="number" step="0.01" min="0" value=\{sellingPrice\}.*?\/>/s,
        replace: `<CurrencyInput value={sellingPrice} onChange={setSellingPrice} required />`
      }
    ]
  },
  {
    path: 'src/components/modals/CreateInvoiceModal.tsx',
    replacements: [
      {
        find: /<input required type="number" step="0.01" min="0" value=\{amount\}.*?\/>/s,
        replace: `<CurrencyInput value={amount} onChange={setAmount} required />`
      }
    ]
  }
];

for (const file of filesToFix) {
  let content = fs.readFileSync(file.path, 'utf-8');
  if (!content.includes('import CurrencyInput')) {
    content = content.replace(
      "import { supabase } from '@/src/lib/supabase';",
      "import { supabase } from '@/src/lib/supabase';\nimport CurrencyInput from '@/src/components/CurrencyInput';"
    );
  }
  for (const r of file.replacements) {
    content = content.replace(r.find, r.replace);
  }
  fs.writeFileSync(file.path, content);
}
