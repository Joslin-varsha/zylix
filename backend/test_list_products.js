import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url');

console.log('--- Supabase Product Lister ---');
if (isSupabaseConfigured) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error.message);
  } else {
    console.log(`Total products in Supabase: ${data.length}`);
    data.forEach((p, idx) => {
      console.log(`${idx + 1}. ID: ${p.id}, Name: "${p.name}", Category: "${p.category}", Price: ${p.price}, Original Price: ${p.original_price}, InStock: ${p.in_stock}`);
    });
  }
} else {
  console.log('Supabase not configured.');
}
