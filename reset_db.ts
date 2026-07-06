import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
    await supabase.from('receipts').delete().neq('id', 0);
    await supabase.from('workshop_queue').delete().neq('id', 0);
    console.log("Database reset");
}
run();
