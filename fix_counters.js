const fs = require('fs');

let c = fs.readFileSync('app/sales/page.tsx', 'utf-8');
c = c.replace(
  "const { count } = await supabase.from('receipts').select('*', { count: 'exact', head: true });",
  "const { count } = await supabase.from('receipts').select('*', { count: 'exact', head: true }).like('receipt_id', 'POS-%');"
);
fs.writeFileSync('app/sales/page.tsx', c);

c = fs.readFileSync('app/workshop/[id]/page.tsx', 'utf-8');
c = c.replace(
  "const { count } = await supabase.from('receipts').select('*', { count: 'exact', head: true });",
  "const { count } = await supabase.from('receipts').select('*', { count: 'exact', head: true }).like('receipt_id', 'REC-%');"
);
fs.writeFileSync('app/workshop/[id]/page.tsx', c);

c = fs.readFileSync('src/components/modals/RecordPastServiceModal.tsx', 'utf-8');
c = c.replace(
  "const { count: recCount } = await supabase.from('receipts').select('*', { count: 'exact', head: true });",
  "const { count: recCount } = await supabase.from('receipts').select('*', { count: 'exact', head: true }).like('receipt_id', 'REC-%');"
);
fs.writeFileSync('src/components/modals/RecordPastServiceModal.tsx', c);
