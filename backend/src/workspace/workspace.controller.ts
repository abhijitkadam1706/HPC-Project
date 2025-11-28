import { Controller, Get, Post, UseGuards, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('files')
  async listFiles(@CurrentUser() user: any, @Query('path') path?: string) {
    return this.workspaceService.listUserFiles(user.id, path);
  }

  @Get('path')
  async getWorkspacePath(@CurrentUser() user: any) {
    return {
      path: await this.workspaceService.getUserWorkspacePath(user.id),
    };
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('path') path?: string,
  ) {
    return this.workspaceService.uploadFiles(user.id, files, path);
  }
}
