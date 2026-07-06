const fs = require('fs');

let c1 = fs.readFileSync('src/components/modals/CreateOrderModal.tsx', 'utf-8');
c1 = c1.replace(
  "const service_id = 'GW-' + Math.floor(Math.random() * 9000 + 1000);",
  `const { count } = await supabase.from('workshop_queue').select('*', { count: 'exact', head: true });
    const nextId = (count || 0) + 1;
    const service_id = 'GW-' + nextId.toString().padStart(2, '0');`
);
fs.writeFileSync('src/components/modals/CreateOrderModal.tsx', c1);

let c2 = fs.readFileSync('app/workshop/[id]/page.tsx', 'utf-8');
c2 = c2.replace(
  "const receipt_id = 'RCP-' + Math.floor(Math.random() * 90000 + 10000);",
  `const { count } = await supabase.from('receipts').select('*', { count: 'exact', head: true });
    const nextId = (count || 0) + 1;
    const receipt_id = 'RCP-' + nextId.toString().padStart(2, '0');`
);
fs.writeFileSync('app/workshop/[id]/page.tsx', c2);

let c3 = fs.readFileSync('src/components/modals/RecordPastServiceModal.tsx', 'utf-8');
c3 = c3.replace(
  "const service_id = 'GW-HIST-' + Math.floor(Math.random() * 9000 + 1000);",
  `const { count } = await supabase.from('workshop_queue').select('*', { count: 'exact', head: true });
    const nextId = (count || 0) + 1;
    const service_id = 'GW-HIST-' + nextId.toString().padStart(2, '0');`
);
c3 = c3.replace(
  "const receipt_id = 'RCP-' + Math.floor(Math.random() * 90000 + 10000);",
  `const { count: recCount } = await supabase.from('receipts').select('*', { count: 'exact', head: true });
    const nextRecId = (recCount || 0) + 1;
    const receipt_id = 'RCP-' + nextRecId.toString().padStart(2, '0');`
);
fs.writeFileSync('src/components/modals/RecordPastServiceModal.tsx', c3);
