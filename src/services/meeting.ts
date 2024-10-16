import { MeetingRepository } from '../data/database/repositories/meeting';
import { RedisClientType } from 'redis';
import { IMeeting } from '../models/meeting';

const CACHE_TIME = 3600; // 1 hour
const CACHE_KEYS = {
  allMeetings: (userId: string, page: number, limit: number) =>
    `meetings:${userId}:page:${page}:limit:${limit}`,
  meetingById: (id: string) => `meeting:${id}`,
  meetingStats: 'meetings:stats',
};

export class MeetingService {
  private meetingRepository: MeetingRepository;
  private redisClient: RedisClientType;

  constructor(
    meetingRepository: MeetingRepository,
    redisClient: RedisClientType
  ) {
    this.meetingRepository = meetingRepository;
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

  async getAllMeetings(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IMeeting[]> {
    const skip = (page - 1) * limit;
    const cacheKey = CACHE_KEYS.allMeetings(userId, page, limit);

    return this.getFromCacheOrRepo(cacheKey, () =>
      this.meetingRepository.findAllByUserWithPagination(userId, skip, limit)
    );
  }

  async getMeetingById(id: string): Promise<IMeeting | null> {
    const cacheKey = CACHE_KEYS.meetingById(id);

    return this.getFromCacheOrRepo(cacheKey, () =>
      this.meetingRepository.findById(id)
    );
  }

  async getMeetingStatistics(): Promise<any> {
    const cacheKey = CACHE_KEYS.meetingStats;

    return this.getFromCacheOrRepo(cacheKey, () =>
      this.meetingRepository.getMeetingStatistics()
    );
  }

  async createMeeting(meeting: IMeeting): Promise<void> {
    await this.meetingRepository.create(meeting);
    await this.redisClient.del(CACHE_KEYS.allMeetings(meeting.userId, 1, 10));
  }

  async updateMeeting(id: string, meeting: Partial<IMeeting>): Promise<void> {
    await this.meetingRepository.update(id, meeting);
    await this.invalidateCache(id);
  }

  async deleteMeeting(id: string): Promise<void> {
    await this.meetingRepository.delete(id);
    await this.invalidateCache(id);
  }

  private async invalidateCache(id: string): Promise<void> {
    await this.redisClient.del(CACHE_KEYS.meetingById(id));
    await this.redisClient.del(CACHE_KEYS.allMeetings('someUserId', 1, 10)); 
  }
}
