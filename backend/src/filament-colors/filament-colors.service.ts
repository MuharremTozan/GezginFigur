import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilamentColor, FilamentColorDocument } from './schemas/filament-color.schema';

@Injectable()
export class FilamentColorsService {
  constructor(
    @InjectModel(FilamentColor.name) private filamentColorModel: Model<FilamentColorDocument>,
  ) {}

  async create(createDto: { colorName: string; hexCode?: string; quantity: number }): Promise<FilamentColorDocument> {
    const created = new this.filamentColorModel(createDto);
    return created.save();
  }

  async findAll(): Promise<FilamentColorDocument[]> {
    return this.filamentColorModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<FilamentColorDocument> {
    const result = await this.filamentColorModel.findById(id).exec();
    if (!result) {
      throw new NotFoundException(`Filament color with ID ${id} not found`);
    }
    return result;
  }

  async update(id: string, updateDto: { colorName?: string; hexCode?: string; quantity?: number }): Promise<FilamentColorDocument> {
    const updated = await this.filamentColorModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Filament color with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<FilamentColorDocument> {
    const deleted = await this.filamentColorModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Filament color with ID ${id} not found`);
    }
    return deleted;
  }
}
