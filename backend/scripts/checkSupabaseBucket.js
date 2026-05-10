const path = require('path');
const dotenv = require('dotenv');

// load env from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const bucket = process.env.SUPABASE_BUCKET || 'PI3Pescadores';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL or SUPABASE_KEY is missing in backend/.env');
  process.exit(1);
}

(async () => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log('Testing bucket:', bucket, 'with URL:', SUPABASE_URL);

    const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });
    if (error) {
      console.error('Supabase list error:', error);
      process.exit(2);
    }

    console.log('Bucket accessible. Sample list:', data);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err && err.message ? err.message : err);
    process.exit(3);
  }
})();
