
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://hlyjgftmbgyegroumbdr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseWpnZnRtYmd5ZWdyb3VtYmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzUyODYsImV4cCI6MjA5Mzg1MTI4Nn0.UEn4F4bNZNr5O7ju-IpOZ3lpq3K9NU8vDVjiiXkaROs";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("--- Checking Database Status ---");
  
  const tables = ['funnel_events', 'funnel_leads', 'funnel_screens', 'funnels', 'ab_tests', 'ab_variants'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`Error checking ${table}:`, error.message);
    } else {
      console.log(`${table}: ${count} records`);
    }
  }
}

run();
