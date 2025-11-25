import { Controller, Get, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('files')
  async listFiles(@CurrentUser() user: any) {
    return this.workspaceService.listUserFiles(user.id);
  }

  @Get('path')
  async getWorkspacePath(@CurrentUser() user: any) {
    return {
      path: await this.workspaceService.getUserWorkspacePath(user.id),
    };
  }
}
