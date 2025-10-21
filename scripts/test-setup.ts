import { DataSource } from 'typeorm';
import { AppDataSource } from '../backend/src/database/data-source';

async function testSetup() {
  console.log('Testing database connection...');
  
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    console.log('✅ Database connection successful');
    
    // Test if tables exist
    const queryRunner = AppDataSource.createQueryRunner();
    const usersTable = await queryRunner.hasTable('users');
    const notesTable = await queryRunner.hasTable('notes');
    
    if (usersTable && notesTable) {
      console.log('✅ Database tables exist');
    } else {
      console.log('❌ Database tables missing. Run migrations first.');
      process.exit(1);
    }
    
    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log('✅ Setup test completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup test failed:', error.message);
    process.exit(1);
  }
}

testSetup();
