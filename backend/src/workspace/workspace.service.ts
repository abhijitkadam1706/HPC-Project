import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);
  private readonly workspaceRoot = process.env.WORKSPACE_ROOT || '/shared/hpc-portal';

  async ensureUserWorkspace(userId: string): Promise<string> {
    const userWorkspace = path.join(this.workspaceRoot, 'users', userId);
    try {
      await fs.mkdir(userWorkspace, { recursive: true });
      this.logger.log(`Ensured workspace exists for user ${userId}`);
      return userWorkspace;
    } catch (error) {
      this.logger.error(`Failed to create workspace for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserWorkspacePath(userId: string): Promise<string> {
    return path.join(this.workspaceRoot, 'users', userId);
  }

  async listUserFiles(userId: string, relativePath?: string): Promise<any[]> {
    const userWorkspace = await this.getUserWorkspacePath(userId);
    const targetPath = relativePath
      ? path.join(userWorkspace, relativePath)
      : userWorkspace;

    try {
      const files = await fs.readdir(targetPath);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(targetPath, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            type: stats.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            modified: stats.mtime,
          };
        })
      );
      return fileDetails;
    } catch (error) {
      this.logger.error(`Failed to list files for user ${userId}:`, error);
      return [];
    }
  }

  async uploadFiles(userId: string, files: Express.Multer.File[], relativePath?: string): Promise<{ uploaded: string[] }> {
    const userWorkspace = await this.getUserWorkspacePath(userId);
    const targetPath = relativePath
      ? path.join(userWorkspace, relativePath)
      : userWorkspace;

    // Ensure directory exists
    await fs.mkdir(targetPath, { recursive: true });

    const uploaded: string[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(targetPath, file.originalname);
        await fs.writeFile(filePath, file.buffer);
        await fs.chmod(filePath, 0o644);
        uploaded.push(file.originalname);
        this.logger.log(`File uploaded: ${filePath}`);
      } catch (error) {
        this.logger.error(`Failed to upload file ${file.originalname}:`, error);
      }
    }

    return { uploaded };
  }
}
