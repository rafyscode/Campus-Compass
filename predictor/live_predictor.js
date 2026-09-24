require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const fetch = require('cross-fetch');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dsjrfsdmsoblwgukkllo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzanJmc2Rtc29ibHdndWtrbGxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYxMTQ1OSwiZXhwIjoyMDk3MTg3NDU5fQ.0F1n44ih5RNsmgTeLuD-LmmIYgtUmtO5KKsPV-_2MgE';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: WebSocket }
});

const LOCATION_ID = 'mensa_main';
const CAPACITY = 700;

let isPredicting = false;

async function runPrediction() {
  if (isPredicting) return;
  isPredicting = true;
  try {
    console.log('Fetching latest 500 records to feed into model...');
    const { data: logs, error } = await supabase
      .from('occupancy_logs')
      .select('created_at, device_count')
      .eq('location_id', LOCATION_ID)
      .order('created_at', { ascending: false })
      .limit(500);
      
    if (error) {
      console.error('Error fetching recent logs:', error);
      isPredicting = false;
      return;
    }
    
    // Sort ascending for time series
    logs.reverse();
    
    let csv = 'captured_at,occupancy_percent\n';
    for (const row of logs) {
      const estimatedPersons = Math.round(row.device_count / 1.6);
      const percent = (estimatedPersons / CAPACITY) * 100;
      csv += `${row.created_at},${percent}\n`;
    }
    
    const mlDir = path.join(__dirname, '../ml');
    fs.mkdirSync(path.join(mlDir, 'data'), { recursive: true });
    const inputCsv = path.join(mlDir, 'data/latest_occupancy.csv');
    fs.writeFileSync(inputCsv, csv);
    
    // Run prediction
    console.log('Running prediction pipeline...');
    const outputJson = path.join(mlDir, 'models/artifacts/latest_forecast.json');
    execSync(`source .venv/bin/activate && python3 predict.py --input data/latest_occupancy.csv --output models/artifacts/latest_forecast.json`, {
      cwd: mlDir,
      shell: '/bin/bash'
    });
    
    const forecasts = JSON.parse(fs.readFileSync(outputJson, 'utf8'));
    
    console.log('Updating ai_forecasts in Supabase...');
    // Clear old forecasts for this generated_at just in case
    // Actually we can just insert and let Supabase handle if there's a conflict, or upsert.
    // Let's clear future forecasts and insert new ones
    await supabase.from('ai_forecasts').delete().eq('location_id', LOCATION_ID);
    
    const rowsToInsert = forecasts.map(f => ({
      location_id: LOCATION_ID,
      generated_at: f.generated_at,
      target_time: f.target_at,
      predicted_count: Math.round((f.predicted_occupancy / 100) * CAPACITY)
    }));
    
    const { error: insError } = await supabase.from('ai_forecasts').insert(rowsToInsert);
    if (insError) {
      console.error('Error inserting forecasts:', insError);
    } else {
      console.log('Forecasts successfully inserted into Supabase!');
    }
    
  } catch(e) {
    console.error('Prediction failed:', e.message);
  } finally {
    isPredicting = false;
  }
}

async function start() {
  console.log('Starting Live Predictor...');
  
  // Predict once on start
  await runPrediction();
  
  // Listen for realtime data
  supabase.channel('public:occupancy_logs')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'occupancy_logs' }, payload => {
      console.log('Received new live data! Running prediction...');
      runPrediction();
    })
    .subscribe((status) => {
      console.log('Realtime subscription status:', status);
    });
}

start();
