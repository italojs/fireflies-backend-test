export interface IMeeting {
  _id?: string;
  userId: string;
  title: string;
  date: Date;
  participants: string[];
  transcript?: string;
  summary?: string;
  actionItems?: string[];
}
