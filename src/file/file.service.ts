import { Injectable, Logger } from '@nestjs/common';
import { Readable, Stream } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { CloudProvidersMetaData } from './cloud.providers.metadata';
import { R_OK } from 'constants';
import { URL } from 'url';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private cloudProviders = new CloudProvidersMetaData();

  private isValidPath(filePath: string): boolean {
    // Define a base directory for file access
    const baseDir = path.resolve(process.cwd(), 'allowed_files');
    const resolvedPath = path.resolve(baseDir, filePath);
    return resolvedPath.startsWith(baseDir);
  }

  private isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      // Allow only specific protocols
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return false;
      }
      // Add more validation logic if needed, e.g., hostname whitelist
      return true;
    } catch (err) {
      return false;
    }
  }

  async getFile(file: string): Promise<Stream> {
    this.logger.log(`Reading file: ${file}`);

    if (!this.isValidPath(file) && !this.isValidUrl(file)) {
      throw new Error('Access to this file path or URL is not allowed');
    }

    if (this.isValidUrl(file)) {
      // Handle URL fetching logic here
      // For example, using axios or another HTTP client to fetch the file
      throw new Error('URL fetching is not implemented');
    }

    const resolvedPath = path.resolve(process.cwd(), file);
    await fs.promises.access(resolvedPath, R_OK);

    return fs.createReadStream(resolvedPath);
  }

  async deleteFile(file: string): Promise<boolean> {
    if (!this.isValidPath(file)) {
      throw new Error('Access to this file path is not allowed');
    }

    const resolvedPath = path.resolve(process.cwd(), file);
    await fs.promises.unlink(resolvedPath);
    return true;
  }
}