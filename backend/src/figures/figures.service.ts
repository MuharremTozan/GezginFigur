import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Figure, FigureDocument } from './schemas/figure.schema';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class FiguresService {
  constructor(
    @InjectModel(Figure.name) private figureModel: Model<FigureDocument>,
    private readonly uploadService: UploadService,
  ) {}

  async create(createDto: { title: string; description?: string; image?: string; publicId?: string; gramsUsed?: number; price?: number; stock?: number; collectionIds?: string[] }): Promise<FigureDocument> {
    const created = new this.figureModel(createDto);
    return (await created.save()).populate('collectionIds');
  }

  async findAll(collectionId?: string): Promise<FigureDocument[]> {
    const filter: any = collectionId ? { collectionIds: new Types.ObjectId(collectionId) } : {};
    return this.figureModel
      .find(filter)
      .populate('collectionIds')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<FigureDocument> {
    const result = await this.figureModel
      .findById(id)
      .populate('collectionIds')
      .exec();
    if (!result) {
      throw new NotFoundException(`Figure with ID ${id} not found`);
    }
    return result;
  }

  async update(
    id: string,
    updateDto: { title?: string; description?: string; image?: string; publicId?: string; gramsUsed?: number; price?: number; stock?: number; collectionIds?: string[] },
  ): Promise<FigureDocument> {
    // If image is being replaced, delete the old one from Cloudinary
    if (updateDto.image) {
      const existing = await this.figureModel.findById(id).exec();
      if (existing && existing.publicId && existing.image !== updateDto.image) {
        await this.uploadService.deleteImage(existing.publicId);
      }
    }

    const updated = await this.figureModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('collectionIds')
      .exec();
    if (!updated) {
      throw new NotFoundException(`Figure with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<FigureDocument> {
    const deleted = await this.figureModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Figure with ID ${id} not found`);
    }

    // Delete associated image from Cloudinary
    if (deleted.publicId) {
      await this.uploadService.deleteImage(deleted.publicId);
    }

    return deleted;
  }
}
