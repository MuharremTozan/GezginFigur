import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collection, CollectionDocument } from './schemas/collection.schema';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name) private collectionModel: Model<CollectionDocument>,
  ) {}

  async create(createDto: { name: string; description?: string; coverImage?: string }): Promise<CollectionDocument> {
    const created = new this.collectionModel(createDto);
    return created.save();
  }

  async findAll(): Promise<CollectionDocument[]> {
    return this.collectionModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<CollectionDocument> {
    const result = await this.collectionModel.findById(id).exec();
    if (!result) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }
    return result;
  }

  async update(id: string, updateDto: { name?: string; description?: string; coverImage?: string }): Promise<CollectionDocument> {
    const updated = await this.collectionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<CollectionDocument> {
    const deleted = await this.collectionModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }
    return deleted;
  }
}
