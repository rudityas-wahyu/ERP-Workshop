const fs = require('fs');
let c = fs.readFileSync('app/sales/page.tsx', 'utf-8');
c = c.replace(/item_name/g, 'product_name');
fs.writeFileSync('app/sales/page.tsx', c);
