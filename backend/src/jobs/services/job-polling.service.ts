import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JobsService } from './jobs.service';

@Injectable()
export class JobPollingService {
  private readonly logger = new Logger(JobPollingService.name);

  constructor(
    private prisma: PrismaService,
    private jobsService: JobsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async pollJobStatuses() {
    this.logger.debug('Polling job statuses...');

    try {
      // Find all active jobs (not in terminal states)
      const activeJobs = await this.prisma.job.findMany({
        where: {
          status: {
            in: ['SUBMITTED', 'QUEUED', 'RUNNING', 'POST_PROCESSING'],
          },
        },
        select: {
          id: true,
          externalSchedulerId: true,
        },
      });

      this.logger.debug(`Found ${activeJobs.length} active jobs to poll`);

      // Update each job status
      const updatePromises = activeJobs.map(job =>
        this.jobsService.updateJobStatus(job.id).catch(error => {
          this.logger.error(`Error updating job ${job.id}: ${error.message}`);
        })
      );

      await Promise.all(updatePromises);

      this.logger.debug('Job polling completed');
    } catch (error) {
      this.logger.error(`Job polling failed: ${error.message}`);
    }
  }
}
