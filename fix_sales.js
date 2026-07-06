const fs = require('fs');
let content = fs.readFileSync('app/sales/page.tsx', 'utf-8');
content = content.replace(
  "inventory.filter(item => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())))",
  "inventory.filter(item => (item?.item_name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || (item?.sku || '').toLowerCase().includes((searchQuery || '').toLowerCase()))"
);
fs.writeFileSync('app/sales/page.tsx', content);
