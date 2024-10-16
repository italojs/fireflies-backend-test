import { MongoClient, Db } from 'mongodb';
import { logger } from '../../utils/logger';

let db: Db;
let client: MongoClient;

export const connectDB = async (mongoUri: string): Promise<Db> => {
  if (!client) {
    client = new MongoClient(mongoUri);
    await client.connect();
    logger.info('Connected to MongoDB');
    db = client.db();
  }
  return db;
};

export const disconnectDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    logger.info('Disconnected from MongoDB');
  }
};
