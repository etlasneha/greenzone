import clientPromise from './mongodb';

const DB_NAME = process.env.MONGODB_DB || 'greenzone';
const COLLECTION_NAME = 'proofRequests';

export async function readProofRequests() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const proofRequests = await collection.find({}).toArray();
    return proofRequests;
  } catch (error) {
    console.error('MongoDB readProofRequests error:', error);
    return [];
  }
}

export async function writeProofRequests(proofRequests: any[]) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  // Clear existing proof requests and insert new ones
  await collection.deleteMany({});
  if (proofRequests.length > 0) {
    await collection.insertMany(proofRequests);
  }
}

export async function addProofRequest(proofRequest: any) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.insertOne(proofRequest);
    return { ...proofRequest, _id: result.insertedId };
  } catch (error) {
    console.error('MongoDB addProofRequest error:', error);
    throw new Error('Failed to save proof request to database');
  }
}

export async function updateProofRequest(id: string, updates: any) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  const result = await collection.updateOne(
    { id: id },
    { $set: updates }
  );
  return result;
}

export async function deleteProofRequest(id: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  const result = await collection.deleteOne({ id: id });
  return result;
} 