const fs = require('fs');
let c = fs.readFileSync('app/sales/page.tsx', 'utf-8');

c = c.replace(
  "const removeFromCart = (id: number) => {",
  `const updateQuantity = (id: any, delta: number) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQ = c.quantity + delta;
        if (newQ > 0 && newQ <= c.stock) {
          return { ...c, quantity: newQ };
        }
      }
      return c;
    }));
  };

  const removeFromCart = (id: number) => {`
);

c = c.replace(
  `<div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500">{formatCurrency(item.selling_price)} x {item.quantity}</span>
                    </div>`,
  `<div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center bg-zinc-800 rounded text-zinc-400 hover:text-white">-</button>
                      <span className="text-xs text-zinc-300 w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center bg-zinc-800 rounded text-zinc-400 hover:text-white">+</button>
                      <span className="text-xs text-zinc-500 ml-2">@ {formatCurrency(item.selling_price)}</span>
                    </div>`
);

fs.writeFileSync('app/sales/page.tsx', c);
