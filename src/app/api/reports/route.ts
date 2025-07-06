import { NextRequest, NextResponse } from 'next/server';
import { readReports, addReport, updateReport, deleteReport } from '../lib/reports';
import { promises as fs } from 'fs';
import path from 'path';
import { readUsers } from '../lib/users';
import { addReportCreatedNotification } from '../lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const reports = await readReports();
    
    // Get user info from cookie
    let userEmail = null;
    let userRole = null;
    const userCookie = req.cookies.get('greenzone_user');
    if (userCookie?.value) {
      try {
        let decoded = decodeURIComponent(userCookie.value);
        try {
          decoded = decodeURIComponent(decoded);
        } catch {}
        const parsed = JSON.parse(decoded);
        userEmail = parsed.email;
        userRole = parsed.role;
      } catch (err) {
        userEmail = userCookie.value;
      }
    }
    
    // If we don't have role from cookie, fetch it from database
    if (!userRole && userEmail) {
      const users = await readUsers();
      const user = users.find((u: any) => u.email === userEmail);
      userRole = user?.role;
    }
    
    // Check if user is admin
    const isAdmin = userRole === 'admin';
    
    let filteredReports = reports;
    
    if (!isAdmin && userEmail) {
      // For regular users, filter out reports they've soft-deleted
      filteredReports = reports.filter((report: any) => {
        // Show reports that either:
        // 1. Don't have a deletedBy array, OR
        // 2. Have a deletedBy array but current user is not in it
        return !report.deletedBy || !report.deletedBy.includes(userEmail);
      });
    }
    
    return NextResponse.json(filteredReports);
  } catch (error) {
    console.error('GET reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const location = formData.get('location') as string;
      const description = (formData.get('description') as string) || '';
      const category = formData.get('category') as string;
      const imageFile = formData.get('image') as File | null;
      let imageUrl = '';
      if (imageFile && typeof imageFile === 'object') {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        const fileName = `${Date.now()}-${imageFile.name}`;
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);
        imageUrl = `/uploads/${fileName}`;
      }
      // Get user email from cookie (robust extraction)
      const userCookie = req.cookies.get('greenzone_user');
      let userEmail = null;
      if (userCookie?.value) {
        try {
          let decoded = decodeURIComponent(userCookie.value);
          try {
            decoded = decodeURIComponent(decoded);
          } catch {}
          const parsed = JSON.parse(decoded);
          userEmail = parsed.email;
        } catch (err) {
          userEmail = userCookie.value;
        }
      }
      // Look up user name
      let userName = null;
      if (userEmail) {
        const users = await readUsers();
        const user = users.find((u: any) => u.email === userEmail);
        if (user) userName = user.name;
      }
      const newReport = {
        id: Date.now().toString(),
        location,
        description, // now optional
        category,
        image: imageUrl,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        userEmail, // associate report with user
        userName,
      };
      const savedReport = await addReport(newReport);
      
      // Send notification to user that report was created
      if (userEmail && userName) {
        try {
          await addReportCreatedNotification(userEmail, userName, savedReport.id, description || location);
        } catch (error) {
          console.error('Failed to send report created notification:', error);
          // Don't fail report creation if notification fails
        }
      }
      
      return NextResponse.json(savedReport, { status: 201 });
    } else {
      // fallback for JSON
      const data = await req.json();
      // Get user email from cookie (robust extraction)
      const userCookie = req.cookies.get('greenzone_user');
      let userEmail = null;
      if (userCookie?.value) {
        try {
          let decoded = decodeURIComponent(userCookie.value);
          try {
            decoded = decodeURIComponent(decoded);
          } catch {}
          const parsed = JSON.parse(decoded);
          userEmail = parsed.email;
        } catch (err) {
          userEmail = userCookie.value;
        }
      }
      // Look up user name
      let userName = null;
      if (userEmail) {
        const users = await readUsers();
        const user = users.find((u: any) => u.email === userEmail);
        if (user) userName = user.name;
      }
      const newReport = {
        id: Date.now().toString(),
        ...data,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        userEmail,
        userName,
      };
      const savedReport = await addReport(newReport);
      
      // Send notification to user that report was created
      if (userEmail && userName) {
        try {
          await addReportCreatedNotification(userEmail, userName, savedReport.id, data.description || data.location);
        } catch (error) {
          console.error('Failed to send report created notification:', error);
          // Don't fail report creation if notification fails
        }
      }
      
      return NextResponse.json(savedReport, { status: 201 });
    }
  } catch (error) {
    console.error('POST reports error:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, userEmail: bodyEmail } = await req.json();
    let reports = await readReports();
    
    // Get user info from cookie
    let userEmail = null;
    let userRole = null;
    const userCookie = req.cookies.get('greenzone_user');
    if (userCookie?.value) {
      try {
        // Try double decode (for double-encoded cookies)
        let decoded = decodeURIComponent(userCookie.value);
        try {
          decoded = decodeURIComponent(decoded);
        } catch {}
        const parsed = JSON.parse(decoded);
        userEmail = parsed.email;
        userRole = parsed.role;
      } catch (err) {
        // fallback: try as plain email
        userEmail = userCookie.value;
      }
    }
    
    // Fallback to body email for local dev/testing
    if (!userEmail && bodyEmail) userEmail = bodyEmail;
    
    // If we don't have role from cookie, fetch it from database
    if (!userRole && userEmail) {
      const users = await readUsers();
      const user = users.find((u: any) => u.email === userEmail);
      userRole = user?.role;
    }
    
    console.log('[DELETE] userEmail:', userEmail, 'userRole:', userRole, 'reportId:', id);
    
    // Find the report
    const idx = reports.findIndex((r: any) => r.id === id);
    if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const report = reports[idx];
    
    // Check if user is admin
    const isAdmin = userRole === 'admin';
    
    if (userEmail && report.userEmail === userEmail) {
      // User is deleting their own report - soft delete
      if (!report.deletedBy) report.deletedBy = [];
      if (!report.deletedBy.includes(userEmail)) report.deletedBy.push(userEmail);
      await updateReport(id, { deletedBy: report.deletedBy });
      return NextResponse.json({ success: true, softDeleted: true });
    } else if (isAdmin) {
      // Admin is deleting any report - hard delete (permanently remove)
      await deleteReport(id);
      return NextResponse.json({ success: true, hardDeleted: true });
    } else {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
  } catch (error) {
    console.error('DELETE reports error:', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
