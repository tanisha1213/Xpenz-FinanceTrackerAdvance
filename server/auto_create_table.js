import { supabase } from './config/supabase.js';

async function setupSubscriptionsTable() {
  console.log('Setting up subscriptions table...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          category TEXT DEFAULT 'Subscriptions',
          "billingCycle" TEXT DEFAULT 'monthly',
          amount NUMERIC NOT NULL CHECK (amount > 0),
          "startDate" TIMESTAMPTZ DEFAULT now(),
          "nextBillingDate" TIMESTAMPTZ NOT NULL,
          "accountId" UUID REFERENCES accounts(id) ON DELETE SET NULL,
          "autoDeduct" BOOLEAN DEFAULT true,
          status TEXT DEFAULT 'active',
          "lastDeductedDate" TIMESTAMPTZ,
          description TEXT,
          "createdAt" TIMESTAMPTZ DEFAULT now()
        );
        ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
      `
    });

    if (error) {
      console.log('RPC exec_sql notice:', error.message);
    } else {
      console.log('Table created successfully via RPC!');
    }
  } catch (err) {
    console.error('RPC Error:', err.message);
  }
}

setupSubscriptionsTable();
