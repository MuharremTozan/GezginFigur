import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FigureDocument = Figure & Document;

@Schema({ timestamps: true })
export class Figure {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ trim: true })
  image: string;

  @Prop({ trim: true })
  publicId: string;

  @Prop({ default: 0 })
  gramsUsed: number;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Collection' }], default: [] })
  collectionIds: MongooseSchema.Types.ObjectId[];
}

export const FigureSchema = SchemaFactory.createForClass(Figure);
