const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/greenzone';
const DB_NAME = process.env.MONGODB_DB || 'greenzone';

async function migrateData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Migrate reports
    try {
      const reportsPath = path.join(process.cwd(), 'src/app/api/reports.json');
      const reportsData = await fs.readFile(reportsPath, 'utf-8');
      const reports = JSON.parse(reportsData);
      
      if (reports.length > 0) {
        await db.collection('reports').insertMany(reports);
        console.log(`Migrated ${reports.length} reports`);
      }
    } catch (error) {
      console.log('No reports.json found or error reading it:', error.message);
    }
    
    // Migrate notifications
    try {
      const notificationsPath = path.join(process.cwd(), 'src/app/api/notifications.json');
      const notificationsData = await fs.readFile(notificationsPath, 'utf-8');
      const notifications = JSON.parse(notificationsData);
      
      if (notifications.length > 0) {
        await db.collection('notifications').insertMany(notifications);
        console.log(`Migrated ${notifications.length} notifications`);
      }
    } catch (error) {
      console.log('No notifications.json found or error reading it:', error.message);
    }
    
    // Migrate users
    try {
      const usersPath = path.join(process.cwd(), 'src/app/api/auth/users.json');
      const usersData = await fs.readFile(usersPath, 'utf-8');
      const users = JSON.parse(usersData);
      
      if (users.length > 0) {
        await db.collection('users').insertMany(users);
        console.log(`Migrated ${users.length} users`);
      }
    } catch (error) {
      console.log('No users.json found or error reading it:', error.message);
    }
    
    // Migrate proof requests
    try {
      const proofRequestsPath = path.join(process.cwd(), 'src/app/api/proofRequests.json');
      const proofRequestsData = await fs.readFile(proofRequestsPath, 'utf-8');
      const proofRequests = JSON.parse(proofRequestsData);
      
      if (proofRequests.length > 0) {
        await db.collection('proofRequests').insertMany(proofRequests);
        console.log(`Migrated ${proofRequests.length} proof requests`);
      }
    } catch (error) {
      console.log('No proofRequests.json found or error reading it:', error.message);
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData }; 