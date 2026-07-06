const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf-8');

content = content.replace(
  "const { data: invs } = await supabase.from('invoices').select('*').eq('status', 'Paid').catch(() => ({ data: [] }));\n      const { data: recs } = await supabase.from('receipts').select('*').catch(() => ({ data: [] }));",
  `const { data: invs, error: invsErr } = await supabase.from('invoices').select('*').eq('status', 'Paid');
      const { data: recs, error: recsErr } = await supabase.from('receipts').select('*');
      
      const safeInvs = invsErr ? [] : (invs || []);
      const safeRecs = recsErr ? [] : (recs || []);
      
      const totalInvoiceRev = safeInvs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const totalReceiptRev = safeRecs.reduce((acc, curr) => acc + (curr.total || 0), 0);
      const totalRevenue = totalInvoiceRev + totalReceiptRev;`
);

fs.writeFileSync('app/page.tsx', content);
