import { Module } from '@nestjs/common';
import { SlurmSchedulerService } from './services/slurm-scheduler.service';

@Module({
  providers: [SlurmSchedulerService],
  exports: [SlurmSchedulerService],
})
export class SchedulerModule {}
