export const config = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/meetingbot',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'yourSecretKey',
};
