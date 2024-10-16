import { Router } from 'express';
import { TaskService } from '../services/task';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth';

export const taskRoutes = (taskService: TaskService) => {
  const router = Router();

  router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.userId; // Pega o userId do token extraído pelo authMiddleware

      if (!userId) {
        res
          .status(400)
          .json({ status: 'fail', message: 'User ID is required' });
        return;
      }

      const tasks = await taskService.getAllTasks(userId); // Assume que o TaskService tem um método para buscar tasks por userId
      res.status(200).json({ status: 'success', data: tasks });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ message: errorMessage });
    }
  });

  return router;
};
