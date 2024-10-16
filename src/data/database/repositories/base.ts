import {
  Collection,
  Db,
  ObjectId,
  Document,
  WithId,
  OptionalUnlessRequiredId,
  Filter,
} from 'mongodb';

export class BaseRepository<T extends Document> {
  protected collection: Collection<T>;

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection(collectionName);
  }

  async findAllByUserWithPagination(
    userId: string,
    skip: number,
    limit: number
  ): Promise<WithId<T>[]> {
    return this.collection
      .find({ userId } as any)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async findAll(): Promise<WithId<T>[]> {
    return this.collection.find().toArray();
  }

  async findById(id: string): Promise<WithId<T> | null> {
    return this.collection.findOne({ _id: new ObjectId(id) } as Filter<T>);
  }

  async create(entity: OptionalUnlessRequiredId<T>): Promise<void> {
    await this.collection.insertOne(entity);
  }

  async update(id: string, entity: Partial<T>): Promise<void> {
    await this.collection.updateOne({ _id: new ObjectId(id) } as Filter<T>, {
      $set: entity,
    });
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) } as Filter<T>);
  }
}
