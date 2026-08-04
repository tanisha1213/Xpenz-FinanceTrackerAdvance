import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_SUPABASE_URL = 'https://vsdntfhpsoydnngmxcgs.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZG50Zmhwc295ZG5uZ214Y2dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMDI3ODUsImV4cCI6MjA5OTU3ODc4NX0.eyHeJnLvvIPKUfoUIyFKtIJo8vqbupYAMDCxD20Ihu8';

const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || DEFAULT_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});
