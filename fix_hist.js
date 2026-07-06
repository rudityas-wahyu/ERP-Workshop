const fs = require('fs');
let c = fs.readFileSync('src/components/modals/RecordPastServiceModal.tsx', 'utf-8');

c = c.replace(
  "const service_id = 'GW-HIST-' + nextId.toString().padStart(2, '0');\n    const receipt_id = 'REC-HIST-' + Math.floor(Math.random() * 9000 + 1000);",
  `const service_id = 'GW-' + nextId.toString().padStart(2, '0');
    const { count: recCount } = await supabase.from('receipts').select('*', { count: 'exact', head: true });
    const receipt_id = 'REC-' + ((recCount || 0) + 1).toString().padStart(2, '0');`
);

fs.writeFileSync('src/components/modals/RecordPastServiceModal.tsx', c);
