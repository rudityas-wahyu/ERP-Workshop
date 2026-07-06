const fs = require('fs');
let content = fs.readFileSync('app/workshop/[id]/page.tsx', 'utf-8');

// Replace the estimated fee inline edit block with a simple display
const regex = /\{isEditingFee \? \([\s\S]*?\}<\/span>\s*\)\}/;
content = content.replace(regex, `<span>{formatCurrency(order.estimated_fee || 0)}</span>`);

// Remove isEditingFee state and editFeeValue state
content = content.replace(/const \[isEditingFee, setIsEditingFee\] = useState\(false\);\n/, "");
content = content.replace(/const \[editFeeValue, setEditFeeValue\] = useState\(0\);\n/, "");

// Remove handleUpdateFee
content = content.replace(/const handleUpdateFee = async \(\) => \{[\s\S]*?fetchData\(\);\n  \};\n/g, "");

// Remove setEditFeeValue from fetch
content = content.replace(/setEditFeeValue\(orderData\.estimated_fee\);\n/, "");

fs.writeFileSync('app/workshop/[id]/page.tsx', content);
