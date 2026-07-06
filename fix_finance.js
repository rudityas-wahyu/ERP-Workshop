const fs = require('fs');
let content = fs.readFileSync('app/finance/page.tsx', 'utf-8');

// Add import
content = content.replace(
  "import RecordPastServiceModal from '@/src/components/modals/RecordPastServiceModal';",
  "import RecordPastServiceModal from '@/src/components/modals/RecordPastServiceModal';\nimport EditTransactionModal from '@/src/components/modals/EditTransactionModal';"
);

// Add state
content = content.replace(
  "const [showPastServiceModal, setShowPastServiceModal] = useState(false);",
  "const [showPastServiceModal, setShowPastServiceModal] = useState(false);\n  const [editTx, setEditTx] = useState<any>(null);"
);

// Add table cell for edit
content = content.replace(
  `<th className="px-6 py-4 font-medium text-right">Amount</th>`,
  `<th className="px-6 py-4 font-medium text-right">Amount</th>\n                  <th className="px-6 py-4 font-medium text-right">Action</th>`
);

content = content.replace(
  /<td className="px-6 py-4 text-right text-sm font-medium text-emerald-400">\s*\+\{formatCurrency\(tx\.amount\)\}\s*<\/td>/,
  `<td className="px-6 py-4 text-right text-sm font-medium text-emerald-400">
                        +{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setEditTx(tx)} className="text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md transition-colors">
                          View / Edit
                        </button>
                      </td>`
);

// Add modal component
content = content.replace(
  "<RecordPastServiceModal",
  `<EditTransactionModal 
        isOpen={!!editTx} 
        onClose={() => setEditTx(null)} 
        onSuccess={fetchData} 
        transaction={editTx} 
      />\n      <RecordPastServiceModal`
);

fs.writeFileSync('app/finance/page.tsx', content);
