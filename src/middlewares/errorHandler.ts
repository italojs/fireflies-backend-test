import { Request, Response } from 'express';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

export const errorHandler = (err: AppError, _req: Request, res: Response) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || 'error';
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Invalid input data';
  }

  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    statusCode = 500;
    message = 'Database Error';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token, please log in again';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired, please log in again';
  }

  if (statusCode === 500) {
    logger.error('ERROR 💥:', err);
  }

  res.status(statusCode).json({
    status,
    message,
  });
};
