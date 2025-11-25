import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { JobTemplatesModule } from './job-templates/job-templates.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { UsageModule } from './usage/usage.module';
import { AdminModule } from './admin/admin.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    JobsModule,
    JobTemplatesModule,
    WorkspaceModule,
    UsageModule,
    AdminModule,
    SchedulerModule,
  ],
})
export class AppModule {}
