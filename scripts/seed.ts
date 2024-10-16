import { MongoClient, Db, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'meetingbot';

const users = ['user1', 'user2', 'user3', 'user4', 'user5'];
const participants = [
  'Alice',
  'Bob',
  'Charlie',
  'David',
  'Eva',
  'Frank',
  'Grace',
  'Henry',
  'Ivy',
  'Jack',
];

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomParticipants(): string[] {
  const count = Math.floor(Math.random() * 5) + 2; // 2 to 6 participants
  return participants.sort(() => 0.5 - Math.random()).slice(0, count);
}

interface IMeeting {
  userId: string;
  title: string;
  date: Date;
  participants: string[];
  transcript: string;
  summary: string;
  actionItems: string[];
}

async function seedMeetings(db: Db) {
  const meetingsCollection = db.collection('meetings');

  await meetingsCollection.deleteMany({});

  const meetings: IMeeting[] = [];

  for (let i = 0; i < 100; i++) {
    const userId = users[Math.floor(Math.random() * users.length)];
    const meeting: IMeeting = {
      userId: userId,
      title: `Meeting ${i + 1}`,
      date: randomDate(new Date(2023, 0, 1), new Date()),
      participants: randomParticipants(),
      transcript: `This is a sample transcript for meeting ${i + 1}.`,
      summary: `Summary of meeting ${i + 1}`,
      actionItems: [
        `Action item 1 for meeting ${i + 1}`,
        `Action item 2 for meeting ${i + 1}`,
      ],
    };
    meetings.push(meeting);

    await meetingsCollection.insertMany(meetings);
    console.log('Meetings seeded successfully');
  }
}

interface ITask {
  meetingId: ObjectId;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
}

async function seedTasks(db: Db) {
  const meetingsCollection = db.collection('meetings');
  const tasksCollection = db.collection('tasks');

  await tasksCollection.deleteMany({});

  const meetings = await meetingsCollection.find().toArray();

  const tasks: ITask[] = [];

  for (const meeting of meetings) {
    const taskCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 tasks per meeting
    for (let i = 0; i < taskCount; i++) {
      const task: ITask = {
        meetingId: meeting._id,
        userId: meeting.userId,
        title: `Task ${i + 1} from ${meeting.title}`,
        description: `This is a sample task from meeting ${meeting.title}`,
        status: ['pending', 'in-progress', 'completed'][
          Math.floor(Math.random() * 3)
        ] as 'pending' | 'in-progress' | 'completed',
        dueDate: new Date(
          meeting.date.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
      };
      tasks.push(task);
    }
  }

  await tasksCollection.insertMany(tasks);
  console.log('Tasks seeded successfully');
}

async function runSeed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB for seeding');

    const db = client.db(DB_NAME);

    await seedMeetings(db);
    await seedTasks(db);
  } catch (err) {
    console.error('MongoDB connection error:', err);
  } finally {
    await client.close();
  }
}

runSeed();
