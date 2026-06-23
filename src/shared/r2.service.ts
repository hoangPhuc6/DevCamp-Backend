import { Injectable } from '@nestjs/common';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private s3Client: S3Client;
  private bucketName = process.env.R2_BUCKET_NAME;

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT, // API S3 Endpoint of Cloudflare R2
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  // Fetches the content of a file from Cloudflare R2 storage using the provided key.
  async getFileContent(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      return await response.Body.transformToString();
    } catch (error) {
      throw new Error(
        `Cannot download file from R2 (Key: ${key}): ${error.message}`,
      );
    }
  }
}
