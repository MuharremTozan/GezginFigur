import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Figure, FigureSchema } from './schemas/figure.schema';
import { FiguresService } from './figures.service';
import { FiguresController } from './figures.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Figure.name, schema: FigureSchema },
    ]),
    UploadModule,
  ],
  controllers: [FiguresController],
  providers: [FiguresService],
  exports: [MongooseModule, FiguresService],
})
export class FiguresModule {}
