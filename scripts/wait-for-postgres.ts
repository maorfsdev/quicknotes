import { DataSource } from 'typeorm';

async function waitForPostgres() {
  const maxRetries = 30;
  const retryDelay = 2000; // 2 seconds
  
  console.log('Waiting for PostgreSQL to be ready...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/quicknotes',
  });
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
      
      // Test the connection
      await dataSource.query('SELECT 1');
      
      console.log('✅ PostgreSQL is ready!');
      await dataSource.destroy();
      return;
      
    } catch (error) {
      console.log(`Attempt ${i + 1}/${maxRetries}: PostgreSQL not ready yet...`);
      
      if (i === maxRetries - 1) {
        console.error('❌ PostgreSQL failed to start after maximum retries');
        process.exit(1);
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

waitForPostgres();
