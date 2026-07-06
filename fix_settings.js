const fs = require('fs');
let content = fs.readFileSync('src/store/settings.ts', 'utf-8');

// Replace formatCurrency implementation
content = content.replace(
  /formatCurrency: \(amountInUSD: number\) => \{[\s\S]*?\},/g,
  `formatCurrency: (amount: number) => {
        const { currency } = get();
        if (currency === 'IDR') {
          const formatted = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount);
          return \`Rp \${formatted},-\`;
        } else if (currency === 'EUR') {
          return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
      },`
);

// Also change parameter name in interface
content = content.replace(
  /formatCurrency: \(amountInUSD: number\) => string;/g,
  `formatCurrency: (amount: number) => string;`
);

fs.writeFileSync('src/store/settings.ts', content);
