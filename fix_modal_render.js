const fs = require('fs');
let content = fs.readFileSync('app/workshop/[id]/page.tsx', 'utf-8');

content = content.replace(
  /<div className="max-w-6xl mx-auto p-4 md:p-8">/,
  `<EditQueueDetailsModal 
        isOpen={showEditDetails} 
        onClose={() => setShowEditDetails(false)} 
        onSuccess={fetchData} 
        order={order} 
      />
      <div className="max-w-6xl mx-auto p-4 md:p-8">`
);

fs.writeFileSync('app/workshop/[id]/page.tsx', content);
