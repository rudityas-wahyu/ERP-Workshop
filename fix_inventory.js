const fs = require('fs');

let content = fs.readFileSync('app/inventory/page.tsx', 'utf-8');

if (!content.includes('EditInventoryModal')) {
  content = content.replace(
    "import AddInventoryModal from '@/src/components/modals/AddInventoryModal';",
    "import AddInventoryModal from '@/src/components/modals/AddInventoryModal';\nimport EditInventoryModal from '@/src/components/modals/EditInventoryModal';"
  );
  
  content = content.replace(
    "const [isOpen, setIsOpen] = useState(false);",
    "const [isOpen, setIsOpen] = useState(false);\n  const [isEditOpen, setIsEditOpen] = useState(false);\n  const [selectedItem, setSelectedItem] = useState<any>(null);"
  );

  content = content.replace(
    "<AddInventoryModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSuccess={fetchInventory} />",
    "<AddInventoryModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSuccess={fetchInventory} />\n      <EditInventoryModal isOpen={isEditOpen} onClose={() => {setIsEditOpen(false); setSelectedItem(null);}} onSuccess={fetchInventory} item={selectedItem} />"
  );
  
  content = content.replace(
    "<th className=\"px-6 py-4 font-medium\">Location</th>",
    "<th className=\"px-6 py-4 font-medium\">Location</th>\n                  <th className=\"px-6 py-4 font-medium text-right\">Action</th>"
  );

  content = content.replace(
    "<td className=\"px-6 py-4 text-xs text-zinc-400\">\n                        {item.location_shelf || '-'}\n                      </td>",
    "<td className=\"px-6 py-4 text-xs text-zinc-400\">\n                        {item.location_shelf || '-'}\n                      </td>\n                      <td className=\"px-6 py-4 text-right\">\n                        <button onClick={() => { setSelectedItem(item); setIsEditOpen(true); }} className=\"text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors border border-zinc-700\">Edit</button>\n                      </td>"
  );
}

fs.writeFileSync('app/inventory/page.tsx', content);
