const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zsquidcmevjjylsqiqcw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcXVpZGNtZXZqanlsc3FpcWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjM5MzYsImV4cCI6MjA4NTc5OTkzNn0.W_fWNKA6JG4_vbUWwj_8OhcQrgtUScbU0bDEHeOamtA';

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('packages').select('*').limit(1);
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Connection successful!');
      console.log('Row count retrieved:', data.length);
    }
  } catch (err) {
    console.error('Network/System Error:', err);
  }
}

testConnection();
