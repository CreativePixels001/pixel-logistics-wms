/**
 * AWS S3 Service
 * Handles file upload, download, and management with AWS S3
 */

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'pixel-logistics-documents';

/**
 * Upload file to S3
 * @param {Object} file - File object from multer
 * @param {string} category - Document category (carrier, driver, vehicle, etc.)
 * @param {string} documentNumber - Unique document identifier
 * @returns {Promise<Object>} Upload result with URL and key
 */
exports.uploadToS3 = async (file, category, documentNumber) => {
  try {
    const key = `${category}/${documentNumber}/${file.filename}`;
    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadDate: new Date().toISOString()
      }
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Delete local file after successful upload
    try {
      fs.unlinkSync(file.path);
    } catch (error) {
      logger.warn('Failed to delete local file after S3 upload:', error);
    }

    return {
      provider: 's3',
      bucket: BUCKET_NAME,
      key: key,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
    };

  } catch (error) {
    logger.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

/**
 * Generate presigned URL for secure file download
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} Presigned URL
 */
exports.getPresignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;

  } catch (error) {
    logger.error('Presigned URL generation error:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
};

/**
 * Download file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<Buffer>} File buffer
 */
exports.downloadFromS3 = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const response = await s3Client.send(command);
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);

  } catch (error) {
    logger.error('S3 download error:', error);
    throw new Error(`Failed to download file from S3: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<void>}
 */
exports.deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
    logger.info(`Successfully deleted file from S3: ${key}`);

  } catch (error) {
    logger.error('S3 delete error:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

/**
 * Check if file exists in S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>} True if file exists
 */
exports.fileExists = async (key) => {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
    return true;

  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    logger.error('S3 file exists check error:', error);
    throw error;
  }
};

/**
 * Copy file within S3 (for versioning)
 * @param {string} sourceKey - Source S3 object key
 * @param {string} destKey - Destination S3 object key
 * @returns {Promise<void>}
 */
exports.copyFile = async (sourceKey, destKey) => {
  try {
    const { CopyObjectCommand } = require('@aws-sdk/client-s3');
    
    const command = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destKey
    });

    await s3Client.send(command);
    logger.info(`Successfully copied file from ${sourceKey} to ${destKey}`);

  } catch (error) {
    logger.error('S3 copy error:', error);
    throw new Error(`Failed to copy file in S3: ${error.message}`);
  }
};

/**
 * Get file metadata from S3
 * @param {string} key - S3 object key
 * @returns {Promise<Object>} File metadata
 */
exports.getFileMetadata = async (key) => {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const response = await s3Client.send(command);

    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
      etag: response.ETag
    };

  } catch (error) {
    logger.error('S3 metadata error:', error);
    throw new Error(`Failed to get file metadata from S3: ${error.message}`);
  }
};

/**
 * Upload multiple files to S3
 * @param {Array} files - Array of file objects from multer
 * @param {string} category - Document category
 * @param {string} documentNumber - Base document identifier
 * @returns {Promise<Array>} Array of upload results
 */
exports.uploadMultipleToS3 = async (files, category, documentNumber) => {
  try {
    const uploadPromises = files.map((file, index) => {
      const uniqueDocNumber = `${documentNumber}-${index + 1}`;
      return this.uploadToS3(file, category, uniqueDocNumber);
    });

    const results = await Promise.all(uploadPromises);
    return results;

  } catch (error) {
    logger.error('S3 multiple upload error:', error);
    throw new Error(`Failed to upload multiple files to S3: ${error.message}`);
  }
};

/**
 * Check S3 configuration
 * @returns {Object} Configuration status
 */
exports.checkS3Config = () => {
  const isConfigured = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION
  );

  return {
    isConfigured,
    bucket: BUCKET_NAME,
    region: process.env.AWS_REGION || 'us-east-1',
    message: isConfigured 
      ? 'S3 is properly configured' 
      : 'S3 credentials not found. Using local storage.'
  };
};

module.exports = exports;
