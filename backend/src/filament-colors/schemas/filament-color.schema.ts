import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FilamentColorDocument = FilamentColor & Document;

@Schema({ timestamps: true })
export class FilamentColor {
  @Prop({ required: true, unique: true, trim: true })
  colorName: string;

  @Prop({ trim: true })
  hexCode: string;

  @Prop({ required: true, default: 0 })
  quantity: number;
}

export const FilamentColorSchema = SchemaFactory.createForClass(FilamentColor);
