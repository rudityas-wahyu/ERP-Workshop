const fs = require('fs');
let content = fs.readFileSync('app/workshop/[id]/page.tsx', 'utf-8');

// 1. Add taxAmount state
content = content.replace(
  "const [discount, setDiscount] = useState(0);",
  "const [discount, setDiscount] = useState(0);\n  const [taxAmount, setTaxAmount] = useState(0);"
);

// 2. Remove hardcoded tax calculation
content = content.replace(
  "const taxAmount = (subtotal - discount) * 0.11;",
  ""
);

// 3. Fix checkout tax input
content = content.replace(
  /<div className="flex justify-between text-sm text-zinc-400">\s*<span>Tax \(11%\)<\/span>\s*<span>\{formatCurrency\(taxAmount\)\}<\/span>\s*<\/div>/,
  `<div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Tax</span>
                <div className="w-28"><CurrencyInput value={taxAmount} onChange={setTaxAmount} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-right text-zinc-100 outline-none focus:border-zinc-700 pl-6" /></div>
              </div>`
);

// 4. Remove inline editing of fee
content = content.replace(
  /const \[isEditingFee, setIsEditingFee\] = useState\(false\);\n  const \[editFeeValue, setEditFeeValue\] = useState\(0\);\n/g,
  ""
);

// Remove the handleSaveFee block completely
content = content.replace(
  /const handleSaveFee = async \(\) => \{[\s\S]*?setIsEditingFee\(false\);\n  \};\n/,
  ""
);

// Replace the Est Service Fee block in the render
content = content.replace(
  /\{isEditingFee \? \([\s\S]*?\}<\/div>\n\s*<\/div>/,
  `<span>{formatCurrency(order.estimated_fee || 0)}</span>
              </div>`
);

// Fix receipt print modal to show the static tax correctly without "11%"
content = content.replace(
  /<div className="flex justify-between text-sm">\s*<span>Tax \(11%\)<\/span>\s*<span>\{formatCurrency\(taxAmount\)\}<\/span>\s*<\/div>/,
  `<div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>`
);

fs.writeFileSync('app/workshop/[id]/page.tsx', content);
