import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
    const { data, error } = await supabase.from('receipts').insert([{
      service_id: 1, // GW-3050 has id 1
      receipt_id: 'RCP-12345',
      subtotal: 100000,
      discount_amount: 0,
      tax_amount: 0,
      total: 100000,
      payment_method: 'Cash',
      amount_paid: 100000,
      change_amount: 0
    }]).select();
    console.log("Error:", error);
    console.log("Data:", data);
}
run();
