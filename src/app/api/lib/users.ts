import clientPromise from './mongodb';

const DB_NAME = process.env.MONGODB_DB || 'greenzone';
const COLLECTION_NAME = 'users';

export async function readUsers() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const users = await collection.find({}).toArray();
    return users;
  } catch (error) {
    console.error('MongoDB readUsers error:', error);
    return [];
  }
}

export async function writeUsers(users: any[]) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  // Clear existing users and insert new ones
  await collection.deleteMany({});
  if (users.length > 0) {
    await collection.insertMany(users);
  }
}

export async function addUser(user: any) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  } catch (error) {
    console.error('MongoDB addUser error:', error);
    throw error;
  }
}

export async function updateUser(email: string, updates: any) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.updateOne(
      { email: email },
      { $set: updates }
    );
    return result;
  } catch (error) {
    console.error('MongoDB updateUser error:', error);
    throw new Error('Failed to update user in database');
  }
}

export async function findUserByEmail(email: string) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const user = await collection.findOne({ email: email });
    return user;
  } catch (error) {
    console.error('MongoDB findUserByEmail error:', error);
    return null;
  }
}

export async function deleteUser(email: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  const result = await collection.deleteOne({ email: email });
  return result;
} 