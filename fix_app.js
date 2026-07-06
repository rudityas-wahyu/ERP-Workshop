const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf-8');

// Catch table missing errors
content = content.replace(
  "const { data: invs } = await supabase.from('invoices').select('*').eq('status', 'Paid');",
  "const { data: invs } = await supabase.from('invoices').select('*').eq('status', 'Paid').catch(() => ({ data: [] }));"
);

content = content.replace(
  "const { data: recs } = await supabase.from('receipts').select('*');",
  "const { data: recs } = await supabase.from('receipts').select('*').catch(() => ({ data: [] }));"
);

fs.writeFileSync('app/page.tsx', content);
