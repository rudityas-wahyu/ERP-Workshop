const fs = require('fs');
let c = fs.readFileSync('app/sales/page.tsx', 'utf-8');

c = c.replace(
  "const receipt_id = 'POS-' + Math.floor(Math.random() * 90000 + 10000);",
  `const { count } = await supabase.from('receipts').select('*', { count: 'exact', head: true });
    const receipt_id = 'POS-' + ((count || 0) + 1).toString().padStart(2, '0');`
);

fs.writeFileSync('app/sales/page.tsx', c);
