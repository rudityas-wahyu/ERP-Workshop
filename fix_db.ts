import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
    // Delete the test receipt we just made
    await supabase.from('receipts').delete().eq('receipt_id', 'RCP-12345');
    
    // Create a real receipt for GW-3050
    const { data: orderData } = await supabase.from('workshop_queue').select('*').eq('id', 1).single();
    if (orderData && orderData.status === 'Done') {
        const fee = orderData.estimated_fee || 100000;
        await supabase.from('receipts').insert([{
            service_id: orderData.id,
            receipt_id: 'RCP-' + Math.floor(Math.random() * 90000 + 10000),
            subtotal: fee,
            discount_amount: 0,
            tax_amount: fee * 0.11,
            total: fee * 1.11,
            payment_method: 'QRIS',
            amount_paid: fee * 1.11,
            change_amount: 0
        }]);
        await supabase.from('workshop_queue').update({ final_fee: fee * 1.11 }).eq('id', 1);
    }
}
run();
