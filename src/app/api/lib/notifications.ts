import clientPromise from './mongodb';

const DB_NAME = process.env.MONGODB_DB || 'greenzone';
const COLLECTION_NAME = 'notifications';

// Notification types for better categorization
export enum NotificationType {
  REPORT_RESOLVED = 'report_resolved',
  REPORT_CREATED = 'report_created',
  REPORT_UPDATED = 'report_updated',
  REPORT_DELETED = 'report_deleted',
  ADMIN_MESSAGE = 'admin_message',
  SYSTEM_UPDATE = 'system_update',
  LEADERBOARD_UPDATE = 'leaderboard_update',
  WELCOME = 'welcome'
}

// Notification priority levels
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export async function readNotifications() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const notifications = await collection.find({}).toArray();
    return notifications;
  } catch (error) {
    console.error('MongoDB readNotifications error:', error);
    return [];
  }
}

export async function readUserNotifications(userEmail: string, limit: number = 50) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const notifications = await collection
      .find({ to: userEmail })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    return notifications;
  } catch (error) {
    console.error('MongoDB readUserNotifications error:', error);
    return [];
  }
}

export async function getUnreadNotificationCount(userEmail: string) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const count = await collection.countDocuments({ 
      to: userEmail, 
      read: { $ne: true } 
    });
    return count;
  } catch (error) {
    console.error('MongoDB getUnreadNotificationCount error:', error);
    return 0;
  }
}

export async function writeNotifications(notifications: any[]) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  // Clear existing notifications and insert new ones
  await collection.deleteMany({});
  if (notifications.length > 0) {
    await collection.insertMany(notifications);
  }
}

export async function addNotification(notification: any) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Add default values if not provided
    const enhancedNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      priority: NotificationPriority.MEDIUM,
      type: NotificationType.SYSTEM_UPDATE,
      ...notification
    };
    
    const result = await collection.insertOne(enhancedNotification);
    return { ...enhancedNotification, _id: result.insertedId };
  } catch (error) {
    console.error('MongoDB addNotification error:', error);
    throw new Error('Failed to save notification to database');
  }
}

export async function addReportResolvedNotification(userEmail: string, userName: string, reportId: string, issueDescription: string, resolutionNote?: string, proofImage?: string) {
  return addNotification({
    to: userEmail,
    userName,
    type: NotificationType.REPORT_RESOLVED,
    priority: NotificationPriority.HIGH,
    title: 'Report Resolved! 🎉',
    message: `Hello ${userName || userEmail}, your reported issue "${issueDescription}" has been resolved.${resolutionNote ? ' Note from admin: ' + resolutionNote : ''} Thank you for helping keep our zone green!`,
    reportId,
    issueDescription,
    proofImage,
    actionUrl: `/my-reports`,
    actionText: 'View Report'
  });
}

export async function addReportCreatedNotification(userEmail: string, userName: string, reportId: string, issueDescription: string) {
  return addNotification({
    to: userEmail,
    userName,
    type: NotificationType.REPORT_CREATED,
    priority: NotificationPriority.MEDIUM,
    title: 'Report Submitted Successfully! 📝',
    message: `Thank you ${userName || userEmail}! Your report "${issueDescription}" has been submitted and is being reviewed. We'll notify you when it's resolved.`,
    reportId,
    issueDescription,
    actionUrl: `/my-reports`,
    actionText: 'View My Reports'
  });
}

export async function addWelcomeNotification(userEmail: string, userName: string) {
  return addNotification({
    to: userEmail,
    userName,
    type: NotificationType.WELCOME,
    priority: NotificationPriority.LOW,
    title: 'Welcome to GreenZone! 🌱',
    message: `Welcome ${userName || userEmail}! Thank you for joining our community. Start by reporting any waste issues you see on campus. Together we can keep our environment clean and green!`,
    actionUrl: `/report`,
    actionText: 'Report Waste'
  });
}

export async function addAdminMessageNotification(userEmail: string, userName: string, message: string, fromAdmin: string) {
  return addNotification({
    to: userEmail,
    userName,
    type: NotificationType.ADMIN_MESSAGE,
    priority: NotificationPriority.HIGH,
    title: `Message from ${fromAdmin} 👨‍💼`,
    message,
    actionUrl: `/account`,
    actionText: 'View Message'
  });
}

export async function updateNotification(id: string, updates: any) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  const result = await collection.updateOne(
    { id: id },
    { $set: updates }
  );
  return result;
}

export async function markNotificationAsRead(id: string) {
  return updateNotification(id, { read: true, readAt: new Date().toISOString() });
}

export async function markAllUserNotificationsAsRead(userEmail: string) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.updateMany(
      { to: userEmail, read: { $ne: true } },
      { $set: { read: true, readAt: new Date().toISOString() } }
    );
    return result;
  } catch (error) {
    console.error('MongoDB markAllUserNotificationsAsRead error:', error);
    throw error;
  }
}

export async function deleteNotification(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.deleteOne({ id: id });
    return result;
  } catch (error) {
    console.error('MongoDB deleteNotification error:', error);
    throw new Error('Failed to delete notification from database');
  }
}

export async function deleteOldNotifications(daysOld: number = 30) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await collection.deleteMany({
      timestamp: { $lt: cutoffDate.toISOString() }
    });
    return result;
  } catch (error) {
    console.error('MongoDB deleteOldNotifications error:', error);
    throw error;
  }
} 