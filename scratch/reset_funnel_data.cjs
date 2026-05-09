
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://hlyjgftmbgyegroumbdr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseWpnZnRtYmd5ZWdyb3VtYmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzUyODYsImV4cCI6MjA5Mzg1MTI4Nn0.UEn4F4bNZNr5O7ju-IpOZ3lpq3K9NU8vDVjiiXkaROs";
const SLUG = "quiz-inner-v1";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("--- Reset Funnel Data ---");
  
  // 1. Get Funnel ID
  const { data: funnel, error: fError } = await supabase
    .from('funnels')
    .select('id, name')
    .eq('slug', SLUG)
    .maybeSingle();

  if (fError || !funnel) {
    console.error("Error finding funnel:", fError || "Funnel not found");
    process.exit(1);
  }

  const funnelId = funnel.id;
  console.log(`Funnel: ${funnel.name} (${funnelId})`);

  // 2. Fetch Data for Backup
  console.log("Fetching events...");
  const { data: events } = await supabase.from('funnel_events').select('*').eq('funnel_id', funnelId);
  console.log("Fetching leads...");
  const { data: leads } = await supabase.from('funnel_leads').select('*').eq('funnel_id', funnelId);

  const backupData = {
    funnel_id: funnelId,
    timestamp: new Date().toISOString(),
    events: events || [],
    leads: leads || []
  };

  const backupFileName = `backup_funnel_data_before_reset_${new Date().toISOString().split('T')[0]}.json`;
  const backupPath = path.join(process.cwd(), 'artifacts', backupFileName);
  
  fs.mkdirSync(path.join(process.cwd(), 'artifacts'), { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`Backup saved to: ${backupPath}`);
  console.log(`Records to clear: ${backupData.events.length} events, ${backupData.leads.length} leads.`);

  // 3. Clear Data
  console.log("Deleting events...");
  const { error: d1 } = await supabase.from('funnel_events').delete().eq('funnel_id', funnelId);
  if (d1) console.error("Error deleting events:", d1);

  console.log("Deleting leads...");
  const { error: d2 } = await supabase.from('funnel_leads').delete().eq('funnel_id', funnelId);
  if (d2) console.error("Error deleting leads:", d2);

  console.log("--- Cleanup complete ---");
}

run();
