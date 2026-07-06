const fs = require('fs');
let content = fs.readFileSync('app/finance/page.tsx', 'utf-8');

content = content.replace(
  '<button onClick={() => setShowManualAdd(true)} className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-zinc-300 rounded-md font-medium text-xs tracking-tight shadow-sm">',
  '<button onClick={() => setShowManualAdd(true)} className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-zinc-300 rounded-md font-medium text-xs tracking-tight shadow-sm">'
);

content = content.replace(
  '+ Add Past Retail Sale',
  '+ Record Custom Income'
);

content = content.replace(
  '<h2 className="text-lg font-medium text-zinc-100 mb-6">Add Past Retail Sale</h2>',
  '<h2 className="text-lg font-medium text-zinc-100 mb-6">Record Custom Income</h2>'
);

fs.writeFileSync('app/finance/page.tsx', content);
