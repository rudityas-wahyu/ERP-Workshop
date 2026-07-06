import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
    const { data, error } = await supabase.from('receipts').select('*, workshop_queue(service_id)').limit(1);
    console.log("Error:", error);
    console.log("Data:", JSON.stringify(data));
}
run();
