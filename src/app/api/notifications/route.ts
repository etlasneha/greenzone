import { NextRequest, NextResponse } from 'next/server';
import { readNotifications, readUserNotifications, getUnreadNotificationCount, markAllUserNotificationsAsRead, deleteOldNotifications } from '../lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail');
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (userEmail) {
      // Get notifications for specific user
      const notifications = await readUserNotifications(userEmail, limit);
      
      if (unreadOnly) {
        const unreadNotifications = notifications.filter(n => !n.read);
        return NextResponse.json(unreadNotifications);
      }
      
      return NextResponse.json(notifications);
    } else {
      // Get all notifications (admin only)
  const notifications = await readNotifications();
      return NextResponse.json(notifications);
    }
  } catch (error) {
    console.error('GET notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, userEmail, notificationId } = await req.json();

    switch (action) {
      case 'markAllAsRead':
        if (!userEmail) {
          return NextResponse.json({ error: 'userEmail required' }, { status: 400 });
        }
        await markAllUserNotificationsAsRead(userEmail);
        return NextResponse.json({ success: true, message: 'All notifications marked as read' });

      case 'getUnreadCount':
        if (!userEmail) {
          return NextResponse.json({ error: 'userEmail required' }, { status: 400 });
        }
        const count = await getUnreadNotificationCount(userEmail);
        return NextResponse.json({ count });

      case 'cleanupOld':
        // Admin only - cleanup notifications older than 30 days
        await deleteOldNotifications(30);
        return NextResponse.json({ success: true, message: 'Old notifications cleaned up' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST notifications error:', error);
    return NextResponse.json({ error: 'Failed to process notification action' }, { status: 500 });
  }
}
