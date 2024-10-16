// unit tests
import { MeetingService } from '../../services/meeting';
import { MeetingRepository } from '../../data/database/repositories/meeting';
import { RedisClientType } from 'redis';
import { IMeeting } from '../../models/meeting';

const mockMeetingRepository = {
  findAllWithPagination: jest.fn() as jest.Mock<Promise<IMeeting[]>>,
  findById: jest.fn() as jest.Mock<Promise<IMeeting | null>>,
  create: jest.fn() as jest.Mock<Promise<void>>,
  update: jest.fn() as jest.Mock<Promise<void>>,
  delete: jest.fn() as jest.Mock<Promise<void>>,
};

const mockRedisClient = {
  get: jest.fn() as jest.Mock<Promise<string | null>>,
  set: jest.fn() as jest.Mock<Promise<void>>,
  del: jest.fn() as jest.Mock<Promise<void>>,
};

const meetingService = new MeetingService(
  mockMeetingRepository as unknown as MeetingRepository,
  mockRedisClient as unknown as RedisClientType
);

const sampleMeeting: IMeeting = {
  userId: 'user1',
  title: 'Meeting 1',
  date: new Date(),
  participants: ['user1', 'user2'],
  transcript: 'Meeting transcript',
  summary: 'Meeting summary',
  actionItems: ['Action item 1'],
};

describe('MeetingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMeetings', () => {
    it('should return meetings from cache if available', async () => {
      const cachedMeetings = JSON.stringify([sampleMeeting]);

      mockRedisClient.get.mockResolvedValue(cachedMeetings);

      const result = await meetingService.getAllMeetings('user1', 1, 10);

      expect(mockRedisClient.get).toHaveBeenCalledWith(
        'meetings:user1:page:1:limit:10'
      );
      expect(result).toEqual([
        { ...sampleMeeting, date: sampleMeeting.date.toISOString() },
      ]);
    });
  });

  describe('getMeetingById', () => {
    it('should return a meeting from cache if available', async () => {
      const cachedMeeting = JSON.stringify(sampleMeeting);

      mockRedisClient.get.mockResolvedValue(cachedMeeting);

      const result = await meetingService.getMeetingById('1');

      expect(mockRedisClient.get).toHaveBeenCalledWith('meeting:1');
      expect(result).toEqual({
        ...sampleMeeting,
        date: sampleMeeting.date.toISOString(),
      });
    });

    it('should fetch a meeting from repository if not cached and cache the result', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      mockMeetingRepository.findById.mockResolvedValue(sampleMeeting);

      const result = await meetingService.getMeetingById('1');

      expect(mockRedisClient.get).toHaveBeenCalledWith('meeting:1');
      expect(mockMeetingRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'meeting:1',
        JSON.stringify(sampleMeeting),
        { EX: 3600 }
      );
      expect(result).toEqual(sampleMeeting);
    });
  });
});
