const fs = require('fs');
let c = fs.readFileSync('src/components/modals/RecordPastServiceModal.tsx', 'utf-8');

c = c.replace(
  "problem_description: problem,",
  "problem_description: problem + ' (Historical Record)',"
);

fs.writeFileSync('src/components/modals/RecordPastServiceModal.tsx', c);
