const fs = require('fs');
let content = fs.readFileSync('src/components/modals/RecordPastServiceModal.tsx', 'utf-8');

content = content.replace(
  "      order_id: orderData.id,\n      service_id: orderData.id,",
  "      service_id: orderData.id,"
);

fs.writeFileSync('src/components/modals/RecordPastServiceModal.tsx', content);
