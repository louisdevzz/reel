import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3'

export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicUrl?: string // Public development URL or custom domain
}

export interface MultipartUploadPart {
  partNumber: number
  etag: string
}

export interface UploadProgress {
  uploadedBytes: number
  totalBytes: number
  percentage: number
}

export class R2Service {
  private client: S3Client
  private bucketName: string
  private publicUrl: string

  constructor(config: R2Config) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      requestHandler: {
        httpOptions: {
          timeout: 1800000, // 30 minutes for large files
          connectTimeout: 10000, // 10 seconds
        }
      }
    })
    this.bucketName = config.bucketName
    this.publicUrl = config.publicUrl || `https://pub-3fc9ba06a236476a952e34beb065779f.r2.dev`
  }

  async createMultipartUpload(key: string) {
    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
    })

    const response = await this.client.send(command)
    return {
      uploadId: response.UploadId,
      key: response.Key,
    }
  }

  async uploadPart(key: string, uploadId: string, partNumber: number, body: Buffer): Promise<MultipartUploadPart> {
    const command = new UploadPartCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: body,
    })

    const response = await this.client.send(command)
    return {
      partNumber,
      etag: response.ETag!,
    }
  }

  async completeMultipartUpload(key: string, uploadId: string, parts: MultipartUploadPart[]) {
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map(part => ({
          PartNumber: part.partNumber,
          ETag: part.etag,
        })),
      },
    })

    const response = await this.client.send(command)
    return {
      location: response.Location,
      etag: response.ETag,
    }
  }

  async abortMultipartUpload(key: string, uploadId: string) {
    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
    })

    await this.client.send(command)
  }

  async uploadVideo(file: Buffer, filename: string, contentType: string): Promise<string> {
    const key = `videos/${Date.now()}-${filename}`
    
    try {
      const uploadId = await this.createMultipartUpload(key)
      
      const fileSize = file.length
      const optimalPartSize = this.calculateOptimalPartSize(fileSize)
      const parts: MultipartUploadPart[] = []
      
      if (fileSize <= optimalPartSize) {
        const part = await this.uploadPart(key, uploadId.uploadId!, 1, file)
        parts.push(part)
      } else {
        const uploadPromises: Promise<MultipartUploadPart>[] = []
        let partNumber = 1
        
        for (let i = 0; i < fileSize; i += optimalPartSize) {
          const chunk = file.slice(i, i + optimalPartSize)
          const uploadPromise = this.uploadPart(key, uploadId.uploadId!, partNumber, chunk)
          uploadPromises.push(uploadPromise)
          partNumber++
        }
        
        const uploadedParts = await Promise.all(uploadPromises)
        parts.push(...uploadedParts.sort((a, b) => a.partNumber - b.partNumber))
      }

      const result = await this.completeMultipartUpload(key, uploadId.uploadId!, parts)
      return `${this.publicUrl}/${key}`
    } catch (error) {
      console.error('R2 upload error:', error)
      throw new Error(`Failed to upload to R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private calculateOptimalPartSize(fileSize: number): number {
    // For files < 100MB, use 5MB parts
    if (fileSize < 100 * 1024 * 1024) {
      return 5 * 1024 * 1024
    }
    // For files < 1GB, use 25MB parts  
    if (fileSize < 1024 * 1024 * 1024) {
      return 25 * 1024 * 1024
    }
    // For files < 5GB, use 100MB parts
    if (fileSize < 5 * 1024 * 1024 * 1024) {
      return 100 * 1024 * 1024
    }
    // For very large files, use 200MB parts for better performance
    return 200 * 1024 * 1024
  }

  async generateThumbnail(videoUrl: string): Promise<string> {
    try {
      // Use a more reliable placeholder service
      return `https://picsum.photos/320/180?random=${Date.now()}`
    } catch (error) {
      console.error('Thumbnail generation error:', error)
      return `https://picsum.photos/320/180?random=${Date.now()}`
    }
  }
} 