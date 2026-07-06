const fs = require('fs');
let content = fs.readFileSync('app/sales/page.tsx', 'utf-8');

// Replace "Tax (11%)" with "Tax" in receipt modal
content = content.replace(/<span>Tax \(11%\)<\/span>/g, "<span>Tax</span>");

fs.writeFileSync('app/sales/page.tsx', content);
