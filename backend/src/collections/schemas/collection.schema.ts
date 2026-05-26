import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CollectionDocument = Collection & Document;

@Schema({ timestamps: true })
export class Collection {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ trim: true })
  coverImage: string;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
