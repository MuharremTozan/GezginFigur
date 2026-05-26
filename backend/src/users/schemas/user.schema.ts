import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  githubId: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  displayName: string;

  @Prop()
  avatarUrl: string;

  @Prop({ default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
