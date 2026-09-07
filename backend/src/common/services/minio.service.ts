import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { Readable } from 'stream';

export interface MinioUploadResult {
  bucket: string;
  objectName: string;
  etag?: string;
  size: number;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;
  private defaultBucket: string;

  async onModuleInit() {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
    this.defaultBucket = process.env.MINIO_BUCKET || 'hospital-files';

    this.client = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL: false,
      accessKey,
      secretKey,
    });

    try {
      await this.ensureBucket(this.defaultBucket);
      this.logger.log(
        `MinIO connected to ${endpoint}:${port}/${this.defaultBucket}`,
      );
    } catch (err) {
      this.logger.warn(
        `MinIO unavailable (${endpoint}:${port}): ${(err as Error).message}. File uploads will fail.`,
      );
    }
  }

  private async ensureBucket(bucket: string): Promise<void> {
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      await this.client.makeBucket(bucket, 'us-east-1');
      this.logger.log(`Bucket "${bucket}" created`);
    }
  }

  async upload(
    bucket: string | undefined,
    objectName: string,
    stream: Readable | Buffer,
    size?: number,
    contentType?: string,
  ): Promise<MinioUploadResult> {
    const targetBucket = bucket || this.defaultBucket;
    await this.ensureBucket(targetBucket);

    const meta: Record<string, string> = {};
    if (contentType) meta['Content-Type'] = contentType;

    const result = await this.client.putObject(
      targetBucket,
      objectName,
      stream,
      size,
      meta,
    );

    return {
      bucket: targetBucket,
      objectName,
      etag: typeof result === 'string' ? result : result?.etag,
      size: size || 0,
    };
  }

  async getStream(
    bucket: string | undefined,
    objectName: string,
  ): Promise<Readable> {
    const targetBucket = bucket || this.defaultBucket;
    return this.client.getObject(targetBucket, objectName);
  }

  async getPresignedUrl(
    bucket: string | undefined,
    objectName: string,
    expiry: number = 3600,
  ): Promise<string> {
    const targetBucket = bucket || this.defaultBucket;
    return this.client.presignedGetObject(targetBucket, objectName, expiry);
  }

  async delete(bucket: string | undefined, objectName: string): Promise<void> {
    const targetBucket = bucket || this.defaultBucket;
    await this.client.removeObject(targetBucket, objectName);
  }

  async stat(
    bucket: string | undefined,
    objectName: string,
  ): Promise<Minio.BucketItemStat> {
    const targetBucket = bucket || this.defaultBucket;
    return this.client.statObject(targetBucket, objectName);
  }

  getBucket(): string {
    return this.defaultBucket;
  }
}
