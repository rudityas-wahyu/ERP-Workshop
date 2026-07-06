const fs = require('fs');

const files = [
  'app/finance/page.tsx',
  'src/components/modals/CreateOrderModal.tsx',
  'src/components/modals/RecordPastServiceModal.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Fix the broken currency symbol string
  content = content.replace(/currency === 'EUR' \? '€' \: '([^']*)';/g, "currency === 'EUR' ? '€' : '$';");
  // If it was corrupted to something else:
  content = content.replace(/currency === 'EUR' \? '€' \: '[\s\S]*?(?=  const \[)/g, "currency === 'EUR' ? '€' : '$';\n");

  fs.writeFileSync(file, content);
}
