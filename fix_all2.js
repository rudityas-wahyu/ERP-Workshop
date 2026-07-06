const fs = require('fs');

const files = [
  'app/finance/page.tsx',
  'src/components/modals/CreateOrderModal.tsx',
  'src/components/modals/RecordPastServiceModal.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  content = content.replace(/currency === 'EUR' \? '€' \: '[^]*?const \[loading/g, "currency === 'EUR' ? '€' : '$';\n  const [loading");
  
  content = content.replace(/currency === 'EUR' \? '€' \: '[^]*?const \[showManualAdd/g, "currency === 'EUR' ? '€' : '$';\n  const [showManualAdd");

  fs.writeFileSync(file, content);
}
