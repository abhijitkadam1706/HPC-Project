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

  async listUserFiles(userId: string): Promise<string[]> {
    const userWorkspace = await this.getUserWorkspacePath(userId);
    try {
      const files = await fs.readdir(userWorkspace);
      return files;
    } catch (error) {
      this.logger.error(`Failed to list files for user ${userId}:`, error);
      return [];
    }
  }
}
