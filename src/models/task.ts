export interface ITask {
  _id?: string;
  meetingId: string;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
}
