const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf-8');

content = content.replace(
  /const totalInvoiceRev = \(invs \|\| \[\]\)\.reduce\(\(acc, curr\) => acc \+ curr\.amount, 0\);\n\s*const totalReceiptRev = \(recs \|\| \[\]\)\.reduce\(\(acc, curr\) => acc \+ curr\.total, 0\);\n\s*const totalRevenue = totalInvoiceRev \+ totalReceiptRev;/,
  ''
);

fs.writeFileSync('app/page.tsx', content);
