import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDB } from './data/database/db';
import { connectRedis } from './data/clients/redis';
import { MeetingRepository } from './data/database/repositories/meeting';
import { TaskRepository } from './data/database/repositories/task';
import { MeetingService } from './services/meeting';
import { TaskService } from './services/task';
import { meetingRoutes } from './routes/meetings';
import { taskRoutes } from './routes/tasks';
import { authMiddleware } from './middlewares/auth';
import { errorHandler } from './middlewares/errorHandler';
import { config } from './config';
import cluster from 'cluster';
import os from 'os';
import { logger } from './utils/logger';

const app = express();
const PORT = config.port;
const numCPUs = os.cpus().length;

const initializeApp = async () => {
  try {
    const db = await connectDB(config.mongoUri);
    const redisClient = await connectRedis();

    const meetingRepository = new MeetingRepository(db);
    const taskRepository = new TaskRepository(db);

    const meetingService = new MeetingService(meetingRepository, redisClient);
    const taskService = new TaskService(taskRepository, redisClient);

    app.use(express.json());
    app.use(authMiddleware);

    app.use('/api/meetings', meetingRoutes(meetingService));
    app.use('/api/tasks', taskRoutes(taskService));

    app.use(errorHandler);

    return { db, redisClient };
  } catch (err) {
    logger.error('Failed to initialize app:', err);
    process.exit(1);
  }
};

if (cluster.isPrimary) {
  logger.info(`Primary process ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.info(
      `Worker ${worker.process.pid} exited with code ${code}, signal ${signal}. Starting a new worker...`
    );
    cluster.fork();
  });
} else {
  initializeApp().then(() => {
    const server = app.listen(PORT, () => {
      logger.info(`Worker ${process.pid} is running on port ${PORT}`);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('SIGINT', () => {
      logger.info('Worker shutting down gracefully...');
      server.close(() => {
        process.exit(0);
      });
    });
  });
}

export { app, initializeApp };
