const fs = require('fs');

let content = fs.readFileSync('src/components/modals/CreateInvoiceModal.tsx', 'utf-8');

if (!content.includes('createdAt')) {
  content = content.replace(
    "const [amount, setAmount] = useState(0);",
    "const [amount, setAmount] = useState(0);\n  const [createdAt, setCreatedAt] = useState(new Date().toISOString().split('T')[0]);"
  );

  content = content.replace(
    "invoice_id, customer, amount, status: 'Pending'",
    "invoice_id, customer, amount, status: 'Pending', created_at: new Date(createdAt).toISOString()"
  );

  content = content.replace(
    "<div>\n            <label className=\"block text-xs font-medium text-zinc-400 mb-1\">Customer Name</label>",
    "<div>\n            <label className=\"block text-xs font-medium text-zinc-400 mb-1\">Date</label>\n            <input required type=\"date\" value={createdAt} onChange={e => setCreatedAt(e.target.value)} className=\"w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700\" />\n          </div>\n          <div>\n            <label className=\"block text-xs font-medium text-zinc-400 mb-1\">Customer Name</label>"
  );
}

fs.writeFileSync('src/components/modals/CreateInvoiceModal.tsx', content);
