
const { createClient } = require('@supabase/supabase-js');
const SLUG = "quiz-inner-v1";

const SUPABASE_URL = "https://hlyjgftmbgyegroumbdr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseWpnZnRtYmd5ZWdyb3VtYmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzUyODYsImV4cCI6MjA5Mzg1MTI4Nn0.UEn4F4bNZNr5O7ju-IpOZ3lpq3K9NU8vDVjiiXkaROs";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("--- Reset Funnel Data (Retry) ---");
  
  const { data: funnel } = await supabase.from('funnels').select('id').eq('slug', SLUG).maybeSingle();
  if (!funnel) { console.error("Funnel not found"); return; }
  const funnelId = funnel.id;

  console.log("Deleting funnel_events...");
  const res1 = await supabase.from('funnel_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Events delete result:", JSON.stringify(res1));

  console.log("Deleting funnel_leads...");
  const res2 = await supabase.from('funnel_leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Leads delete result:", JSON.stringify(res2));

  console.log("--- Verification ---");
  const { count: c1 } = await supabase.from('funnel_events').select('*', { count: 'exact', head: true });
  const { count: c2 } = await supabase.from('funnel_leads').select('*', { count: 'exact', head: true });
  console.log(`Current counts: Events=${c1}, Leads=${c2}`);
}

run();
