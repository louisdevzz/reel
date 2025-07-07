import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
const db = drizzle(client);

async function checkAndFixSchema() {
  try {
    console.log('🔍 Checking stream_keys table schema...');
    
    // Expected columns based on the schema
    const expectedColumns = [
      'id',
      'user_id', 
      'key',
      'name',
      'is_active',
      'is_live',
      'created_at',
      'last_used',
      'livepeer_stream_id',
      'playback_url'
    ];
    
    // Get all current columns
    const allColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'stream_keys'
      ORDER BY ordinal_position
    `;
    
    const existingColumns = allColumns.map(col => col.column_name);
    console.log('\n📋 Current stream_keys table columns:');
    allColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check for missing columns
    const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`\n❌ Missing columns: ${missingColumns.join(', ')}`);
      console.log('🔧 Adding missing columns...');
      
      for (const column of missingColumns) {
        if (column === 'livepeer_stream_id') {
          await client`ALTER TABLE stream_keys ADD COLUMN livepeer_stream_id text`;
          console.log('✅ Added livepeer_stream_id column');
        } else if (column === 'playback_url') {
          await client`ALTER TABLE stream_keys ADD COLUMN playback_url text`;
          console.log('✅ Added playback_url column');
        }
      }
    } else {
      console.log('\n✅ All expected columns exist');
    }
    
    // Show final schema
    const finalColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'stream_keys'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Final stream_keys table columns:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkAndFixSchema(); 