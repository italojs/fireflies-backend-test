import Joi from 'joi';

export const meetingSchema = Joi.object({
  userId: Joi.string(),
  title: Joi.string().required(),
  date: Joi.date().required(),
  participants: Joi.array().items(Joi.string()).min(1).required(),
  transcript: Joi.string().optional(),
  summary: Joi.string().optional(),
  actionItems: Joi.array().items(Joi.string()).optional(),
});
