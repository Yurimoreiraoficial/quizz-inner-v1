
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://hlyjgftmbgyegroumbdr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseWpnZnRtYmd5ZWdyb3VtYmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzUyODYsImV4cCI6MjA5Mzg1MTI4Nn0.UEn4F4bNZNr5O7ju-IpOZ3lpq3K9NU8vDVjiiXkaROs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("--- Reset Funnel Data (Individual) ---");
  
  const { data: events } = await supabase.from('funnel_events').select('id');
  const { data: leads } = await supabase.from('funnel_leads').select('id');

  console.log(`Attempting to delete ${events?.length} events and ${leads?.length} leads by ID...`);

  if (events) {
    for (const ev of events) {
      const { error } = await supabase.from('funnel_events').delete().eq('id', ev.id);
      if (error) console.log(`Error deleting event ${ev.id}:`, error.message);
    }
  }

  if (leads) {
    for (const l of leads) {
      const { error } = await supabase.from('funnel_leads').delete().eq('id', l.id);
      if (error) console.log(`Error deleting lead ${l.id}:`, error.message);
    }
  }

  const { count: c1 } = await supabase.from('funnel_events').select('*', { count: 'exact', head: true });
  const { count: c2 } = await supabase.from('funnel_leads').select('*', { count: 'exact', head: true });
  console.log(`Final counts: Events=${c1}, Leads=${c2}`);
}

run();
