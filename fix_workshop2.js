const fs = require('fs');
let content = fs.readFileSync('app/workshop/[id]/page.tsx', 'utf-8');

if (!content.includes('EditQueueDetailsModal')) {
  content = content.replace(
    "import CurrencyInput from '@/src/components/CurrencyInput';",
    "import CurrencyInput from '@/src/components/CurrencyInput';\nimport EditQueueDetailsModal from '@/src/components/modals/EditQueueDetailsModal';"
  );
  
  content = content.replace(
    "const [amountPaid, setAmountPaid] = useState(0);",
    "const [amountPaid, setAmountPaid] = useState(0);\n  const [showEditDetails, setShowEditDetails] = useState(false);"
  );

  content = content.replace(
    /<h2 className="text-xs font-mono uppercase text-zinc-500 tracking-widest mb-4">Service Details<\/h2>/,
    `<div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-mono uppercase text-zinc-500 tracking-widest">Service Details</h2>
                {order.status !== 'Done' && (
                  <button onClick={() => setShowEditDetails(true)} className="text-[10px] uppercase font-medium tracking-wider text-emerald-400 hover:text-emerald-300">
                    Edit
                  </button>
                )}
              </div>`
  );

  // Add the modal component at the end of the return statement before </AppLayout>
  content = content.replace(
    /(\s*)<\/AppLayout>/,
    `$1  <EditQueueDetailsModal 
        isOpen={showEditDetails} 
        onClose={() => setShowEditDetails(false)} 
        onSuccess={fetchData} 
        order={order} 
      />
$1</AppLayout>`
  );

  fs.writeFileSync('app/workshop/[id]/page.tsx', content);
}
