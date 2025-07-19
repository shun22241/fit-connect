// Quick test to verify environment variables
console.log('🔍 Testing environment variables...\n');

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Load .env.local file
require('dotenv').config({ path: '.env.local' });

console.log('\n🔄 After loading .env.local:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

// Check if URL is valid
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (url) {
  try {
    new URL(url);
    console.log('\n✅ Supabase URL is valid');
  } catch (e) {
    console.log('\n❌ Supabase URL is invalid:', e.message);
  }
}