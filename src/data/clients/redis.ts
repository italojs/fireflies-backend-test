import { createClient, RedisClientType } from 'redis';
import { config } from '../../config';
import { AppError } from '../../utils/appError';
import { logger } from '../../utils/logger';

const redisClient: RedisClientType = createClient({
  url: config.redisUrl,
});

redisClient.on('error', (err) => {
  throw new AppError('Redis connection error:', err);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis');
  } catch (err) {
    logger.error((err as Error).message);
    throw new AppError('Error connecting to the Redis');
  }
  return redisClient;
};
