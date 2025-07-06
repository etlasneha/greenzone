import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = process.env.MONGODB_DB || 'greenzone';
const COLLECTION_NAME = 'reports';

export async function readReports() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const reports = await collection.find({}).toArray();
    return reports;
  } catch (error) {
    console.error('MongoDB readReports error:', error);
    return [];
  }
}

export async function writeReports(reports: any[]) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  // Clear existing reports and insert new ones
  await collection.deleteMany({});
  if (reports.length > 0) {
    await collection.insertMany(reports);
  }
}

export async function addReport(report: any) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.insertOne(report);
    return { ...report, _id: result.insertedId };
  } catch (error) {
    console.error('MongoDB addReport error:', error);
    throw new Error('Failed to save report to database');
  }
}

export async function updateReport(id: string, updates: any) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.updateOne(
      { id: id },
      { $set: updates }
    );
    return result;
  } catch (error) {
    console.error('MongoDB updateReport error:', error);
    throw new Error('Failed to update report in database');
  }
}

export async function deleteReport(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.deleteOne({ id: id });
    return result;
  } catch (error) {
    console.error('MongoDB deleteReport error:', error);
    throw new Error('Failed to delete report from database');
  }
}

export async function findReportById(id: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  const report = await collection.findOne({ id: id });
  return report;
} 