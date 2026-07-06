const fs = require('fs');
let content = fs.readFileSync('app/workshop/[id]/page.tsx', 'utf-8');

// 1. Fix the broken loading block
content = content.replace(
  /if \(loading\) return <AppLayout><div className="p-8 text-zinc-500">Loading order details\.\.\.<\/div>\s*<EditQueueDetailsModal\s*isOpen=\{showEditDetails\}\s*onClose=\{\(\) => setShowEditDetails\(false\)\}\s*onSuccess=\{fetchData\}\s*order=\{order\}\s*\/>\s*<\/AppLayout>;/,
  'if (loading) return <AppLayout><div className="p-8 text-zinc-500">Loading order details...</div></AppLayout>;'
);

// 2. Add EditQueueDetailsModal to the main return block
content = content.replace(
  /<AppLayout>\s*<div className="max-w-6xl mx-auto p-4 md:p-8">/,
  `<AppLayout>
      <EditQueueDetailsModal 
        isOpen={showEditDetails} 
        onClose={() => setShowEditDetails(false)} 
        onSuccess={fetchData} 
        order={order} 
      />
      <div className="max-w-6xl mx-auto p-4 md:p-8">`
);

fs.writeFileSync('app/workshop/[id]/page.tsx', content);
