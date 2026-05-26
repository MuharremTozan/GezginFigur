import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilamentColor, FilamentColorSchema } from './schemas/filament-color.schema';
import { FilamentColorsService } from './filament-colors.service';
import { FilamentColorsController } from './filament-colors.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FilamentColor.name, schema: FilamentColorSchema },
    ]),
  ],
  controllers: [FilamentColorsController],
  providers: [FilamentColorsService],
  exports: [MongooseModule, FilamentColorsService],
})
export class FilamentColorsModule {}
