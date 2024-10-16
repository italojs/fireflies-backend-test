import { BaseRepository } from './base';
import { Db } from 'mongodb';
import { ITask } from '../../../models/task';

export class TaskRepository extends BaseRepository<ITask> {
  constructor(db: Db) {
    super(db, 'tasks');
  }
}
