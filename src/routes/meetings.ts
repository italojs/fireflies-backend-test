import { Router } from 'express';
import { MeetingService } from '../services/meeting';
import { validate } from '../middlewares/validate';
import { meetingSchema } from '../schemas/meeting';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth';

export const meetingRoutes = (meetingService: MeetingService) => {
  const router = Router();

  router.get(
    '/',
    authMiddleware,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.userId;

        if (!userId) {
          res
            .status(400)
            .json({ status: 'fail', message: 'User ID is required' });
          return;
        }

        const meetings = await meetingService.getAllMeetings(
          userId,
          Number(page),
          Number(limit)
        );
        res.status(200).json({ status: 'success', data: meetings });
      } catch (err) {
        next(err);
      }
    }
  );

  router.post(
    '/',
    authMiddleware,
    validate(meetingSchema),
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const meeting = req.body;
        const userId = req.userId;

        if (!userId) {
          res
            .status(400)
            .json({ status: 'fail', message: 'User ID is required' });
          return;
        }

        const newMeeting = { ...meeting, userId };
        await meetingService.createMeeting(newMeeting);
        res.status(201).json({ message: 'Meeting created successfully' });
      } catch (err) {
        next(err);
      }
    }
  );

  router.get(
    '/stats',
    authMiddleware,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const stats = await meetingService.getMeetingStatistics();
        res.status(200).json({ status: 'success', data: stats });
      } catch (err) {
        next(err);
      }
    }
  );

  router.get(
    '/:id',
    authMiddleware,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const { id } = req.params;
        const meeting = await meetingService.getMeetingById(id);

        if (!meeting) {
          res
            .status(404)
            .json({ status: 'fail', message: 'Meeting not found' });
          return;
        }

        res.status(200).json({ status: 'success', data: meeting });
      } catch (err) {
        next(err);
      }
    }
  );

  router.put(
    '/:id',
    authMiddleware,
    validate(meetingSchema),
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const { id } = req.params;
        const meetingUpdates = req.body;
        const userId = req.userId;

        if (!userId) {
          res
            .status(400)
            .json({ status: 'fail', message: 'User ID is required' });
          return;
        }

        const existingMeeting = await meetingService.getMeetingById(id);

        if (!existingMeeting) {
          res
            .status(404)
            .json({ status: 'fail', message: 'Meeting not found' });
          return;
        }

        if (existingMeeting.userId !== userId) {
          res.status(403).json({
            status: 'fail',
            message: 'Unauthorized to update this meeting',
          });
          return;
        }

        await meetingService.updateMeeting(id, meetingUpdates);
        res.status(200).json({ message: 'Meeting updated successfully' });
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
};
