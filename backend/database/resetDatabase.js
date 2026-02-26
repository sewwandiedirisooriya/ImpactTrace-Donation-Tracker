// database/resetDatabase.js
// ⚠️ WARNING: This will DELETE all data and recreate tables!
// Run this to reset database: node database/resetDatabase.js

const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'impacttrace.db');

console.log('⚠️  WARNING: This will DELETE all data!');
console.log('📍 Database location:', dbPath);
console.log('\n⚠️  IMPORTANT: Make sure the server is NOT running!');
console.log('   Close any database viewers or connections first.\n');

// Wait 2 seconds to give user time to read
setTimeout(() => {
  // Check if database exists
  if (fs.existsSync(dbPath)) {
    console.log('🗑️  Deleting existing database...');
    try {
      fs.unlinkSync(dbPath);
      console.log('✅ Database deleted successfully!');
      console.log('\n📝 Next steps:');
      console.log('  1. Run: npm run db:setup');
      console.log('  2. Run: npm run db:seed (optional)');
      console.log('  3. Start server: npm start');
    } catch (error) {
      console.error('\n❌ Error deleting database:', error.message);
      console.error('\n💡 Possible causes:');
      console.error('  1. Server is still running - Stop the server first');
      console.error('  2. Database is open in a viewer - Close DB Browser/SQLite tools');
      console.error('  3. File is locked by another process\n');
      console.error('🔧 Try these steps:');
      console.error('  1. Stop the backend server (Ctrl+C in terminal)');
      console.error('  2. Close any database viewers');
      console.error('  3. Run this script again');
      process.exit(1);
    }
  } else {
    console.log('ℹ️  No database found. Nothing to delete.');
    console.log('\n📝 Run: npm run db:setup to create a new database.');
  }
}, 2000);
