const fs = require('fs');
let content = fs.readFileSync('src/components/modals/EditQueueDetailsModal.tsx', 'utf-8');

// Add estimatedFee state
content = content.replace(
  "const [pickupDate, setPickupDate] = useState('');",
  "const [pickupDate, setPickupDate] = useState('');\n  const [estimatedFee, setEstimatedFee] = useState(0);"
);

// Read from order
content = content.replace(
  "setPickupDate(order.pickup_date || '');",
  "setPickupDate(order.pickup_date || '');\n      setEstimatedFee(order.estimated_fee || 0);"
);

// Add to update query
content = content.replace(
  "pickup_date: pickupDate,",
  "pickup_date: pickupDate,\n      estimated_fee: estimatedFee,"
);

// Add CurrencyInput import
if (!content.includes('CurrencyInput')) {
  content = content.replace(
    "import { supabase } from '@/src/lib/supabase';",
    "import { supabase } from '@/src/lib/supabase';\nimport CurrencyInput from '@/src/components/CurrencyInput';"
  );
}

// Add Estimated Fee input field inside the form, below the grid with technician and pickup date
content = content.replace(
  /<\/div>\n\s*<div className="flex justify-end gap-3 mt-8">/,
  `</div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Est. Service Fee</label>
            <CurrencyInput value={estimatedFee} onChange={setEstimatedFee} />
          </div>
          <div className="flex justify-end gap-3 mt-8">`
);

fs.writeFileSync('src/components/modals/EditQueueDetailsModal.tsx', content);
