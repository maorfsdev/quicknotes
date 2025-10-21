import { DataSource } from 'typeorm';
import { User } from '../backend/src/users/entities/user.entity';
import { Note } from '../backend/src/notes/entities/note.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  let dataSource: DataSource | null = null;
  
  try {
    console.log('Starting database seeding...');

    // Initialize data source
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'quicknotes',
      entities: [User, Note],
      synchronize: false,
      logging: false,
    });

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const userRepository = dataSource.getRepository(User);
    const noteRepository = dataSource.getRepository(Note);

    // Create demo user
    const existingUser = await userRepository.findOne({ where: { email: 'test@example.com' } });
    let user: User;

    if (existingUser) {
      console.log('Demo user already exists, using existing user...');
      user = existingUser;
    } else {
      console.log('Creating demo user...');
      const passwordHash = await bcrypt.hash('Passw0rd!', 10);
      user = userRepository.create({
        email: 'test@example.com',
        passwordHash,
      });
      await userRepository.save(user);
      console.log('Demo user created successfully');
    }

    // Create demo notes
    const existingNotes = await noteRepository.find({ where: { userId: user.id } });
    
    if (existingNotes.length === 0) {
      console.log('Creating demo notes...');
      
      const demoNotes = [
        {
          title: 'Welcome to QuickNotes',
          content: 'This is your first note! You can create, edit, and organize your notes with tags.',
          tags: ['welcome', 'getting-started'],
        },
        {
          title: 'Meeting Notes',
          content: 'Team standup meeting:\n- Discussed project progress\n- Reviewed sprint goals\n- Planned next week tasks',
          tags: ['work', 'meeting', 'team'],
        },
        {
          title: 'Shopping List',
          content: 'Things to buy:\n- Milk\n- Bread\n- Eggs\n- Coffee',
          tags: ['personal', 'shopping'],
        },
        {
          title: 'Learning React',
          content: 'React concepts to study:\n- Hooks (useState, useEffect)\n- Component lifecycle\n- State management\n- Props vs State',
          tags: ['learning', 'react', 'programming'],
        },
        {
          title: 'Recipe Ideas',
          content: 'Dinner ideas for this week:\n- Pasta with marinara sauce\n- Grilled chicken with vegetables\n- Fish tacos\n- Vegetarian stir-fry',
          tags: ['cooking', 'recipes', 'meal-planning'],
        },
      ];

      for (const noteData of demoNotes) {
        const note = noteRepository.create({
          ...noteData,
          userId: user.id,
        });
        await noteRepository.save(note);
      }

      console.log('Demo notes created successfully');
    } else {
      console.log('Demo notes already exist, skipping...');
    }

    console.log('Database seeding completed successfully!');
    console.log('\nDemo credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Passw0rd!');
    console.log('\nYou can now login to the application with these credentials.');

  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seed();
