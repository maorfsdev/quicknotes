const axios = require('axios');

async function createUser() {
  try {
    console.log('Creating demo user...');
    
    const response = await axios.post('http://localhost:3000/auth/register', {
      email: 'test@example.com',
      password: 'Passw0rd!'
    });
    
    console.log('✅ Demo user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: Passw0rd!');
    
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('✅ Demo user already exists!');
      console.log('Email: test@example.com');
      console.log('Password: Passw0rd!');
    } else {
      console.error('❌ Error creating user:', error.response?.data || error.message);
    }
  }
}

createUser();
