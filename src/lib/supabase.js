import { createClient } from '@supabase/supabase-js';

// In a real job, use .env files. For this deadline, hardcoding is acceptable.
const supabaseUrl = 'https://plgajtzlftdpjhrespuo.supabase.co/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZ2FqdHpsZnRkcGpocmVzcHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNzI1MDcsImV4cCI6MjA4Mjc0ODUwN30.fow05dYB-m56dgTTR0hvdkZ47fTzI4ObI7uDHUfsfAY';

export const supabase = createClient(supabaseUrl, supabaseKey);