import { TaskRepository } from '../data/database/repositories/task';
import { ITask } from '../models/task';
import { RedisClientType } from 'redis';

const CACHE_TIME = 3600; // 1h

const CACHE_KEYS = {
  allTasks: (userId: string) => `tasks:${userId}`,
};

export class TaskService {
  private taskRepository: TaskRepository;
  private redisClient: RedisClientType;

  constructor(taskRepository: TaskRepository, redisClient: RedisClientType) {
    this.taskRepository = taskRepository;
    this.redisClient = redisClient;
  }

  private async getFromCacheOrRepo<T>(
    cacheKey: string,
    repoFunc: () => Promise<T>
  ): Promise<T> {
    const cachedData = await this.redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const data = await repoFunc();
    await this.redisClient.set(cacheKey, JSON.stringify(data), {
      EX: CACHE_TIME,
    });

    return data;
  }

  async getAllTasks(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ITask[]> {
    const skip = (page - 1) * limit;
    const cacheKey = CACHE_KEYS.allTasks(userId);

    return this.getFromCacheOrRepo(cacheKey, () =>
      this.taskRepository.findAllByUserWithPagination(userId, skip, limit)
    );
  }

  async createTask(task: ITask): Promise<void> {
    await this.taskRepository.create(task);
    await this.redisClient.del(CACHE_KEYS.allTasks(task.userId));
  }
}
