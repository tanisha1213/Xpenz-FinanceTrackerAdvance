import { supabase } from './config/supabase.js';

async function createSubscriptionsTable() {
  console.log('Verifying subscriptions table in Supabase...');
  try {
    // Check if table exists by selecting 1 row
    const { data, error } = await supabase.from('subscriptions').select('id').limit(1);
    if (error && error.code === '42P01') {
      console.log('Subscriptions table does not exist yet. Please run schema_subscriptions.sql in Supabase SQL Editor.');
    } else if (error) {
      console.log('Table query notice:', error.message);
    } else {
      console.log('Subscriptions table exists and is accessible!');
    }
  } catch (err) {
    console.error('Error checking subscriptions table:', err.message);
  }
}

createSubscriptionsTable();
