const fs = require('fs');
for (const file of ['app/invoices/page.tsx', 'app/finance/page.tsx']) {
  let c = fs.readFileSync(file, 'utf-8');
  c = c.replace(
    "desc: 'Workshop Service ' + (r.workshop_queue?.service_id || r.service_id),",
    "desc: r.receipt_id?.startsWith('POS') ? 'Retail Sale' : 'Workshop Service ' + (r.workshop_queue?.service_id || r.service_id),"
  );
  c = c.replace(
    "type: 'Service Receipt'",
    "type: r.receipt_id?.startsWith('POS') ? 'POS Receipt' : 'Service Receipt'"
  );
  fs.writeFileSync(file, c);
}
