// regression tests
import request from 'supertest';
import { app, initializeApp } from '../../server';
import { disconnectDB } from '../../data/database/db';
import { generateToken } from '../../../scripts/generate-jwt';

let jwtToken: string;

beforeAll(async () => {
  await initializeApp();
  jwtToken = generateToken('user1');
});

afterAll(async () => {
  await disconnectDB();
});

describe('API Tests', () => {
  it('should return meetings', async () => {
    const res = await request(app)
      .get('/api/meetings')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should create a new meeting', async () => {
    const newMeeting = {
      title: 'New Meeting',
      date: new Date(),
      participants: ['Alice', 'Bob'],
      transcript: 'Here is the meeting transcript',
      summary: 'Here is the meeting summary',
      actionItems: ['Action 1', 'Action 2'],
    };

    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(newMeeting);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Meeting created successfully');
  });
});
