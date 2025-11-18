import axios from 'axios';

const runMigration = async () => {
  try {
    console.log('Starting capacity field migration...');
    
    // You'll need to replace this with a valid admin token
    // You can get this by logging in as admin and copying the token from localStorage or network tab
    const token = 'YOUR_ADMIN_TOKEN_HERE';
    
    const response = await axios.post(
      'http://localhost:5000/api/admin/sync-capacity',
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Migration completed successfully!');
    console.log('Results:', response.data);
    
  } catch (error) {
    console.error('❌ Migration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

runMigration();
