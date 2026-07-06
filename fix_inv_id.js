const fs = require('fs');
let c1 = fs.readFileSync('src/components/modals/CreateInvoiceModal.tsx', 'utf-8');
c1 = c1.replace(
  "const invoice_id = 'INV-' + Math.floor(Math.random() * 9000 + 1000);",
  `const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
    const nextId = (count || 0) + 1;
    const invoice_id = 'INV-' + nextId.toString().padStart(2, '0');`
);
fs.writeFileSync('src/components/modals/CreateInvoiceModal.tsx', c1);
