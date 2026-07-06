const fs = require('fs');
let c = fs.readFileSync('app/workshop/[id]/page.tsx', 'utf-8');

c = c.replace(
  `const addPart = async (inventoryId: number, price: number) => {
    await supabase.from('service_parts').insert([{
      service_id: orderId,
      inventory_id: inventoryId,
      quantity: 1,
      price_per_unit: price
    }]);
    fetchData();
  };`,
  `const addPart = async (inventoryId: number, price: number) => {
    const existing = parts.find(p => p.inventory_id === inventoryId);
    if (existing) {
      await supabase.from('service_parts').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('service_parts').insert([{
        service_id: orderId,
        inventory_id: inventoryId,
        quantity: 1,
        price_per_unit: price
      }]);
    }
    fetchData();
  };

  const updatePartQuantity = async (partId: number, delta: number) => {
    const part = parts.find(p => p.id === partId);
    if (!part) return;
    const newQ = part.quantity + delta;
    if (newQ > 0) {
      await supabase.from('service_parts').update({ quantity: newQ }).eq('id', partId);
    } else {
      await supabase.from('service_parts').delete().eq('id', partId);
    }
    fetchData();
  };`
);

c = c.replace(
  `<div className="text-zinc-300">
                        {part.inventory?.product_name} <span className="text-zinc-500 text-xs ml-2">x{part.quantity}</span>
                      </div>`,
  `<div className="text-zinc-300 flex items-center gap-3">
                        <span>{part.inventory?.product_name || part.inventory?.item_name || 'Part'}</span>
                        {order.status !== 'Done' ? (
                          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded">
                            <button onClick={() => updatePartQuantity(part.id, -1)} className="w-5 h-5 flex justify-center items-center text-zinc-400 hover:text-white">-</button>
                            <span className="text-xs w-4 text-center">{part.quantity}</span>
                            <button onClick={() => updatePartQuantity(part.id, 1)} className="w-5 h-5 flex justify-center items-center text-zinc-400 hover:text-white">+</button>
                          </div>
                        ) : (
                           <span className="text-zinc-500 text-xs">x{part.quantity}</span>
                        )}
                      </div>`
);

fs.writeFileSync('app/workshop/[id]/page.tsx', c);
