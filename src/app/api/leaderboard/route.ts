import { NextResponse } from 'next/server';
import { readUsers } from '../lib/users';
import { readReports } from '../lib/reports';

// Only resolved reports contribute to the leaderboard score.
export async function GET() {
  const users = await readUsers();
  const reports = await readReports();
  // Build leaderboard: count resolved reports per user, exclude admins
  const leaderboard = users
    .filter((user: any) => user.role !== 'admin')
    .map((user: any) => {
      // Only count resolved reports for this user, and not soft-deleted by them
      const userReports = reports.filter((r: any) => {
        const isUser = (r.userId && r.userId === user.id) || (r.userEmail && r.userEmail === user.email);
        const notSoftDeleted = !r.deletedBy || !r.deletedBy.includes(user.email);
        return isUser && r.status === 'Resolved' && notSoftDeleted;
      });
      return {
        name: user.name || user.email.split('@')[0],
        email: user.email,
        userId: user.id,
        reports: userReports.length,
        points: userReports.length * 10, // 10 points per resolved report
      };
    });
  // Sort by points descending
  leaderboard.sort((a: any, b: any) => b.points - a.points);
  return NextResponse.json(leaderboard);
}
