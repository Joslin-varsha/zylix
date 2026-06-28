import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('--- Database Product Inspection (ID: 25) ---');
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', 25)
  .single();

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Database Row:', JSON.stringify(data, null, 2));
}
