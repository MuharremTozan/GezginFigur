import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectionsModule } from './collections/collections.module';
import { FiguresModule } from './figures/figures.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { FilamentColorsModule } from './filament-colors/filament-colors.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Establish connection to MongoDB using MONGODB_URI
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    // Feature & Security Modules
    UsersModule,
    AuthModule,
    CollectionsModule,
    FiguresModule,
    UploadModule,
    FilamentColorsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
