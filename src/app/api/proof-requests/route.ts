import { NextRequest, NextResponse } from 'next/server';
import { readProofRequests, addProofRequest, updateProofRequest } from '../lib/proofRequests';

// POST: User requests a proof image for a report
export async function POST(req: NextRequest) {
  try {
    const { reportId, userEmail } = await req.json();
    if (!reportId || !userEmail) {
      return NextResponse.json({ error: 'Missing reportId or userEmail' }, { status: 400 });
    }
    const requests = await readProofRequests();
    // Prevent duplicate requests for the same report/user
    if (requests.some((r: any) => r.reportId === reportId && r.userEmail === userEmail)) {
      return NextResponse.json({ message: 'Request already exists' }, { status: 200 });
    }
    const newRequest = {
      id: Date.now().toString(),
      reportId,
      userEmail,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    await addProofRequest(newRequest);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST proof-requests error:', error);
    return NextResponse.json({ error: 'Failed to create proof request' }, { status: 500 });
  }
}

// GET: Admin fetches all proof image requests
export async function GET() {
  try {
    const requests = await readProofRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error('GET proof-requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch proof requests' }, { status: 500 });
  }
}

// PATCH: Admin fulfills a proof image request
export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing proof request id' }, { status: 400 });
    }
    await updateProofRequest(id, { status: 'fulfilled' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH proof-requests error:', error);
    return NextResponse.json({ error: 'Failed to update proof request' }, { status: 500 });
  }
}
