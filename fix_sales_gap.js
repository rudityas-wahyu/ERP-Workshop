const fs = require('fs');
let c = fs.readFileSync('app/sales/page.tsx', 'utf-8');
c = c.replace(
  '<div className="mt-4 flex flex-col items-start">',
  '<div className="mt-4 flex flex-col items-start gap-0.5">'
);
fs.writeFileSync('app/sales/page.tsx', c);
