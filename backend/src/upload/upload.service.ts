import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

const MOCK_PUBLIC_ID = 'mock_cloudinary_id';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    // Only configure Cloudinary if the keys are defined
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.logger.log('Cloudinary successfully configured.');
    } else {
      this.logger.warn('Cloudinary credentials missing in environment variables. Uploads will fail.');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId || publicId === MOCK_PUBLIC_ID) {
      return;
    }

    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    if (!cloudName || cloudName.includes('your_cloudinary')) {
      this.logger.warn('Cloudinary not configured. Skipping image deletion.');
      return;
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Cloudinary image deleted: ${publicId} (result: ${result.result})`);
    } catch (error) {
      this.logger.error(`Failed to delete Cloudinary image: ${publicId}`, error);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }

    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    if (!cloudName || cloudName.includes('your_cloudinary')) {
      // Fallback: If credentials are not configured yet, return a mockup URL so they can test the app
      this.logger.warn('Cloudinary not configured. Returning mockup image URL.');
      return {
        secure_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=60',
        public_id: MOCK_PUBLIC_ID,
      } as UploadApiResponse;
    }

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gezgin_figur',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary upload error:', error);
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Cloudinary upload completed with no result.'));
          }
          resolve(result);
        },
      );

      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }
}
