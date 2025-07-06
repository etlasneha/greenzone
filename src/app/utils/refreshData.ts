// Utility function to refresh MongoDB data
export async function refreshMongoDBData() {
  try {
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear localStorage if needed
      localStorage.removeItem('cached_reports');
      localStorage.removeItem('cached_users');
      localStorage.removeItem('cached_notifications');
    }

    // Fetch fresh data from all endpoints
    const [reportsRes, usersRes, notificationsRes] = await Promise.all([
      fetch('/api/reports'),
      fetch('/api/admin/users'),
      fetch('/api/notifications')
    ]);

    const reports = await reportsRes.json();
    const users = await usersRes.json();
    const notifications = await notificationsRes.json();

    console.log('✅ MongoDB data refreshed successfully');
    console.log(`📊 Reports: ${reports.length}`);
    console.log(`👥 Users: ${users.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);

    return { reports, users, notifications };
  } catch (error) {
    console.error('❌ Failed to refresh MongoDB data:', error);
    throw error;
  }
}

// Function to refresh specific collection
export async function refreshCollection(collectionName: string) {
  try {
    let endpoint = '';
    switch (collectionName) {
      case 'reports':
        endpoint = '/api/reports';
        break;
      case 'users':
        endpoint = '/api/admin/users';
        break;
      case 'notifications':
        endpoint = '/api/notifications';
        break;
      default:
        throw new Error(`Unknown collection: ${collectionName}`);
    }

    const response = await fetch(endpoint);
    const data = await response.json();
    
    console.log(`✅ ${collectionName} refreshed: ${data.length} items`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to refresh ${collectionName}:`, error);
    throw error;
  }
}

// Function to trigger a page refresh
export function refreshPage() {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

// Function to refresh specific page data
export function refreshPageData() {
  if (typeof window !== 'undefined') {
    // Dispatch custom event to trigger data refresh
    window.dispatchEvent(new Event('refresh-data'));
  }
} 