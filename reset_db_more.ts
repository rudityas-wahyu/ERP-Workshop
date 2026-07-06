import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
    await supabase.from('invoices').delete().neq('id', 0);
    await supabase.from('service_parts').delete().neq('id', 0);
    console.log("Database reset more");
}
run();
