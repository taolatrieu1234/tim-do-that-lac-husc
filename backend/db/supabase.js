const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Sử dụng Service Role Key để backend có quyền Admin vượt qua RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
