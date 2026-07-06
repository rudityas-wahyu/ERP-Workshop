const fs = require('fs');
let c = fs.readFileSync('app/invoices/page.tsx', 'utf-8');

c = c.replace(
  "import { useSettingsStore } from '@/src/store/settings';",
  "import { useSettingsStore } from '@/src/store/settings';\nimport EditTransactionModal from '@/src/components/modals/EditTransactionModal';"
);

c = c.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n  const [selectedTx, setSelectedTx] = useState<any>(null);"
);

c = c.replace(
  '<th className="px-6 py-4 font-medium text-zinc-400 text-right">Amount</th>\n              </tr>',
  '<th className="px-6 py-4 font-medium text-zinc-400 text-right">Amount</th>\n                <th className="px-6 py-4 font-medium text-zinc-400 text-right">Actions</th>\n              </tr>'
);

c = c.replace(
  '<td className="px-6 py-4 text-right font-medium text-zinc-100">{formatCurrency(tx.amount)}</td>\n                  </tr>',
  `<td className="px-6 py-4 text-right font-medium text-zinc-100">{formatCurrency(tx.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedTx(tx)} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded transition-colors">
                        View / Edit
                      </button>
                    </td>
                  </tr>`
);

c = c.replace(
  '</AppLayout>\n  );\n}',
  `  <EditTransactionModal 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
        onSuccess={fetchData} 
        transaction={selectedTx} 
      />
    </AppLayout>
  );
}`
);

fs.writeFileSync('app/invoices/page.tsx', c);
