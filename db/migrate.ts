import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseServiceKey || !databaseUrl) {
  throw new Error('Missing required environment variables');
}

async function runMigration() {
  const direction = process.argv[2]; // 'up' or 'down'
  
  try {
    console.log('🔄 Starting migration...');
    
    // For migrations, we use direct postgres connection
    const migrationClient = postgres(databaseUrl, { max: 1 });
    const db = drizzle(migrationClient);

    if (direction === 'down') {
      console.log('⚠️ Rolling back last migration...');
      // Get the list of applied migrations
      const { data: migrations } = await db.select().from('drizzle.migrations');
      
      if (!migrations || migrations.length === 0) {
        console.log('No migrations to roll back');
        process.exit(0);
      }

      // Sort migrations by timestamp descending
      const sortedMigrations = migrations.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Get the latest migration
      const latestMigration = sortedMigrations[0];

      // Remove the latest migration from drizzle.migrations table
      await db.delete('drizzle.migrations')
        .where('id', '=', latestMigration.id);

      console.log(`✅ Rolled back migration: ${latestMigration.name}`);
    } else {
      // Run migrations
      console.log('⬆️ Running pending migrations...');
      await migrate(db, { migrationsFolder: 'drizzle/migrations' });
      console.log('✅ Migrations completed');
    }

    await migrationClient.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 