import { supabase } from './config/supabase.js';

async function check() {
  console.log("=== LOANS ===");
  const { data: loans, error: lErr } = await supabase.from('loans').select('*');
  if (lErr) console.error("Loans error:", lErr);
  else console.log(JSON.stringify(loans, null, 2));

  console.log("=== TRANSACTIONS ===");
  const { data: txs, error: tErr } = await supabase.from('transactions').select('*').order('createdAt', { ascending: false }).limit(5);
  if (tErr) console.error("Transactions error:", tErr);
  else console.log(JSON.stringify(txs, null, 2));

  console.log("=== ACCOUNTS ===");
  const { data: accs, error: aErr } = await supabase.from('accounts').select('*');
  if (aErr) console.error("Accounts error:", aErr);
  else console.log(JSON.stringify(accs, null, 2));
}

check();
