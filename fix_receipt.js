const fs = require('fs');

let content = fs.readFileSync('app/workshop/[id]/page.tsx', 'utf-8');

if (!content.includes('showReceipt')) {
  content = content.replace(
    "const { formatCurrency } = useSettingsStore();",
    "const { formatCurrency, workshopName, workshopAddress, workshopPhone } = useSettingsStore();\n  const [showReceipt, setShowReceipt] = useState(false);\n  const [receiptId, setReceiptId] = useState('');"
  );

  content = content.replace(
    "alert(`Receipt ${receipt_id} Generated! Printing...`);",
    "setReceiptId(receipt_id);\n    setShowReceipt(true);\n    setShowCheckout(false);"
  );

  const printModal = `
      {/* Print Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl text-zinc-900 relative">
            <div className="text-center mb-6 border-b border-zinc-200 pb-4">
              <h2 className="text-xl font-bold tracking-tight">{workshopName || 'Guitar Workshop'}</h2>
              <p className="text-xs text-zinc-500 mt-1 whitespace-pre-wrap">{workshopAddress}</p>
              <p className="text-xs text-zinc-500">{workshopPhone}</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Receipt No:</span>
                <span className="font-mono font-medium">{receiptId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Date:</span>
                <span className="font-mono">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Customer:</span>
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Service:</span>
                <span className="font-medium">{order.service_id}</span>
              </div>
            </div>

            <div className="border-t border-b border-zinc-200 py-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Service Fee</span>
                <span>{formatCurrency(order.estimated_fee)}</span>
              </div>
              {parts.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Parts ({parts.length})</span>
                  <span>{formatCurrency(partsTotal)}</span>
                </div>
              )}
              {order.has_down_payment && (
                <div className="flex justify-between text-sm">
                  <span>Down Payment</span>
                  <span>-{formatCurrency(order.down_payment_amount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax (11%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            </div>
            
            <div className="flex justify-between text-lg font-bold mb-2">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Payment Method</span>
              <span>{paymentMethod}</span>
            </div>
            
            {paymentMethod === 'Cash' && (
              <>
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Amount Given</span>
                  <span>{formatCurrency(amountPaid)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mb-6">
                  <span>Change</span>
                  <span>{formatCurrency(Math.max(0, changeAmount))}</span>
                </div>
              </>
            )}

            <div className="text-center text-xs text-zinc-400 mt-8 mb-6">
              Thank you for choosing {workshopName || 'Guitar Workshop'}!
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowReceipt(false); fetchData(); }} className="flex-1 py-2 text-sm font-medium text-zinc-500 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors">Close</button>
              <button onClick={() => window.print()} className="flex-1 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors">Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
`;

  content = content.replace("    </AppLayout>\n  );\n}", printModal + "\n  );\n}");
}

fs.writeFileSync('app/workshop/[id]/page.tsx', content);
