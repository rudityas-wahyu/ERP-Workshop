const { createClient } = require('@supabase/supabase-js');
global.window = {};
try {
  createClient('https://xfnqyswubdvsrfvsnwxl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.xxx');
} catch(e) {
  console.log(e.message);
}
