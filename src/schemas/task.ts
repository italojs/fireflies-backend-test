import Joi from 'joi';

export const taskSchema = Joi.object({
  meetingId: Joi.string().required(),
  userId: Joi.string(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().valid('pending', 'in-progress', 'completed').required(),
  dueDate: Joi.date().required(),
});
