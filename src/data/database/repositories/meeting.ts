import { Db } from 'mongodb';
import { IMeeting } from '../../../models/meeting';
import { BaseRepository } from './base';

export class MeetingRepository extends BaseRepository<IMeeting> {
  constructor(db: Db) {
    super(db, 'meetings');
  }

  async getMeetingStatistics(): Promise<any> {
    const totalMeetings = await this.collection.countDocuments();

    const participantStats = await this.collection
      .aggregate([
        { $unwind: '$participants' },
        {
          $group: {
            _id: '$participants',
            count: { $sum: 1 }, // Count the number of times each participant appears
          },
        },
        { $sort: { count: -1 } }, // Sort participants by their count (descending)
        { $limit: 5 }, // Limit to top 5 participants
      ])
      .toArray();

    const totalParticipants = await this.collection
      .aggregate([
        {
          $project: {
            participantCount: {
              $cond: {
                if: { $isArray: '$participants' }, // Check if `participants` is an array
                then: { $size: '$participants' }, // Get the size of the `participants` array
                else: 0, // If it's not an array, treat as 0 participants
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalParticipants: { $sum: '$participantCount' }, // Sum of all participants
            averageParticipants: { $avg: '$participantCount' }, // Average participants per meeting
          },
        },
      ])
      .toArray();

    return {
      totalMeetings,
      totalParticipants: totalParticipants[0]?.totalParticipants || 0,
      averageParticipants: totalParticipants[0]?.averageParticipants || 0,
      topParticipants: participantStats.map((stat) => ({
        participant: stat._id,
        meetingCount: stat.count,
      })),
    };
  }
}
