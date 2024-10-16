import jwt from 'jsonwebtoken';
import { config } from '../src/config';

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' });
};

if(process.env.NODE_ENV !== 'TEST') console.log(generateToken('someUserId'));