const fs = require('fs');
let content = fs.readFileSync('app/workshop/[id]/page.tsx', 'utf-8');

content = content.replace(
  /<div className="max-w-5xl mx-auto space-y-6 pb-12">/,
  `<EditQueueDetailsModal 
        isOpen={showEditDetails} 
        onClose={() => setShowEditDetails(false)} 
        onSuccess={fetchData} 
        order={order} 
      />
      <div className="max-w-5xl mx-auto space-y-6 pb-12">`
);

fs.writeFileSync('app/workshop/[id]/page.tsx', content);
