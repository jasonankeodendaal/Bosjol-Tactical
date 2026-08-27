import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
  const payload1 = {
      id: 'brandingDetails',
      adminDashboardBackgroundUrl: 'https://TESTING_CAMEL'
  };
  const { data: data1 } = await supabase.from('settings').upsert(payload1).select();
  console.log("Returned:", data1[0]);
}
check();
