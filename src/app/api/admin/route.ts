import { NextRequest, NextResponse } from 'next/server';
import { readReports, writeReports } from '../lib/reports';
import { readNotifications, writeNotifications, addReportResolvedNotification } from '../lib/notifications';

export async function GET() {
  const reports = await readReports();
  return NextResponse.json(reports);
}

export async function PATCH(req: NextRequest) {
  const { id, status, resolutionNote, proofImage, userEmail, userName, issueDescription } = await req.json();
  let reports = await readReports();
  const report = reports.find((r: any) => r.id === id);
  if (report) {
    report.status = status;
    if (resolutionNote) report.resolutionNote = resolutionNote;
    if (proofImage) report.proofImage = proofImage;
    await writeReports(reports);
    // Send notification if resolved
    if (status === 'Resolved' && userEmail) {
      try {
        await addReportResolvedNotification(userEmail, userName, id, issueDescription, resolutionNote, proofImage || report.proofImage);
      } catch (error) {
        console.error('Failed to send resolution notification:', error);
        // Don't fail admin action if notification fails
      }
    }
    return NextResponse.json(report);
  }
  return NextResponse.json({ error: 'Report not found' }, { status: 404 });
}
