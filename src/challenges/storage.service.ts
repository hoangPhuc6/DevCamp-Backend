import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

// This is function configured to use AWS S3 for storage.
@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    // Define constructor connect with Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('R2_endpoint'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_Access_Key_Id')!,
        secretAccessKey: this.configService.get<string>(
          'R2_Secret_Access_Key',
        )!,
      },
    });
    this.bucketName = this.configService.get<string>('Bucket_name')!;
  }

  // Function upload file tescase
  async upFile(file: Buffer, filename: string, Type: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: file,
      ContentType: Type,
    });
    await this.s3Client.send(command); // Send to R2
    return filename; // return pathfile to save DB
  }
}
