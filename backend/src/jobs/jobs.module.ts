import { Module } from '@nestjs/common';
import { JobsService } from './services/jobs.service';
import { JobsController } from './controllers/jobs.controller';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { JobPollingService } from './services/job-polling.service';

@Module({
  imports: [SchedulerModule],
  controllers: [JobsController],
  providers: [JobsService, JobPollingService],
  exports: [JobsService],
})
export class JobsModule {}
