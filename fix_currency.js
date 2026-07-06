const fs = require('fs');
let content = fs.readFileSync('src/components/CurrencyInput.tsx', 'utf-8');
if (!content.includes("'use client'")) {
  fs.writeFileSync('src/components/CurrencyInput.tsx', "'use client';\n" + content);
}
