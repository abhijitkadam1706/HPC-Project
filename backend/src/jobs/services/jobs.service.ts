import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SlurmSchedulerService } from '../../scheduler/services/slurm-scheduler.service';
import { CreateJobDto } from '../dto/create-job.dto';
import { ConfigService } from '@nestjs/config';
import { writeFile, mkdir, chmod, readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import archiver from 'archiver';
import { JobStatus, JobEventType } from '@prisma/client';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly workspaceRoot: string;

  constructor(
    private prisma: PrismaService,
    private scheduler: SlurmSchedulerService,
    private configService: ConfigService,
  ) {
    this.workspaceRoot = this.configService.get('WORKSPACE_ROOT') || '/shared/hpc-portal';
  }

  async create(userId: string, dto: CreateJobDto) {
    // Create job record
    const job = await this.prisma.job.create({
      data: {
        userId,
        jobName: dto.jobName,
        description: dto.description,
        environmentType: dto.environmentType,
        environmentConfig: dto.environmentConfig,
        queue: dto.queue,
        jobType: dto.jobType || 'SINGLE',
        nodes: dto.nodes || 1,
        tasks: dto.tasks || 1,
        cpusPerTask: dto.cpusPerTask || 1,
        memoryPerNodeGB: dto.memoryPerNodeGB || 4,
        gpusPerNode: dto.gpusPerNode || 0,
        walltimeSeconds: dto.walltimeSeconds,
        priority: dto.priority || 0,
        workingDirectory: '', // Will be set below
        command: dto.command,
        arguments: dto.arguments,
        preJobScript: dto.preJobScript,
        postJobScript: dto.postJobScript,
        inputLocationType: dto.inputLocationType,
        inputLocationRef: dto.inputLocationRef,
        outputLocationType: dto.outputLocationType,
        outputLocationRef: dto.outputLocationRef,
        retentionPolicy: dto.retentionPolicy || 'DAYS_30',
        status: 'SUBMITTED',
      },
    });

    // Create job working directory
    const workingDir = join(this.workspaceRoot, 'users', userId, 'jobs', job.id);

    try {
      await mkdir(workingDir, { recursive: true });
      // Set permissions so Slurm user can write output files
      await chmod(workingDir, 0o777);

      // Update job with working directory
      await this.prisma.job.update({
        where: { id: job.id },
        data: { workingDirectory: workingDir },
      });

      // Build Slurm script
      const scriptContent = await this.scheduler.buildJobScript({
        ...job,
        workingDirectory: workingDir,
        environmentConfig: dto.environmentConfig,
      });

      // Write script to file
      const scriptPath = join(workingDir, 'job.sh');
      await writeFile(scriptPath, scriptContent);
      // Make script executable and readable by all
      await chmod(scriptPath, 0o755);

      // Submit to Slurm
      const { schedulerJobId } = await this.scheduler.submitJob(job.id, scriptPath);

      // Update job with scheduler ID and status
      const updatedJob = await this.prisma.job.update({
        where: { id: job.id },
        data: {
          externalSchedulerId: schedulerJobId,
          status: 'QUEUED',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create job event
      await this.prisma.jobEvent.create({
        data: {
          jobId: job.id,
          type: 'SUBMITTED',
          message: `Job submitted to Slurm with ID ${schedulerJobId}`,
        },
      });

      this.logger.log(`Job ${job.id} created and submitted to Slurm as ${schedulerJobId}`);

      return updatedJob;
    } catch (error) {
      // Update job status to failed
      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          statusReason: error.message,
        },
      });

      await this.prisma.jobEvent.create({
        data: {
          jobId: job.id,
          type: 'FAILED',
          message: `Job submission failed: ${error.message}`,
        },
      });

      throw error;
    }
  }

  async findAll(userId: string, filters?: any) {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { jobName: { contains: filters.search, mode: 'insensitive' } },
        { id: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const jobs = await this.prisma.job.findMany({
      where,
      orderBy: { submissionTime: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return jobs;
  }

  async findOne(id: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        events: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.userId !== userId) {
      throw new ForbiddenException('You do not have access to this job');
    }

    return job;
  }

  async cancel(id: string, userId: string) {
    const job = await this.findOne(id, userId);

    if (job.status !== 'QUEUED' && job.status !== 'RUNNING') {
      throw new ForbiddenException('Job cannot be cancelled in current state');
    }

    if (job.externalSchedulerId) {
      await this.scheduler.cancelJob(job.externalSchedulerId);
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.jobEvent.create({
      data: {
        jobId: id,
        type: 'CANCELLED',
        message: 'Job cancelled by user',
      },
    });

    return updatedJob;
  }

  async getEvents(id: string, userId: string) {
    await this.findOne(id, userId); // Check access

    return this.prisma.jobEvent.findMany({
      where: { jobId: id },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getLogs(id: string, userId: string, type?: string) {
    await this.findOne(id, userId); // Check access

    const where: any = { jobId: id };
    if (type) {
      where.type = type.toUpperCase();
    }

    return this.prisma.jobLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update job status from scheduler
   * This is called by the background worker
   */
  async updateJobStatus(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || !job.externalSchedulerId) {
      return;
    }

    // Skip if job is already in terminal state
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status)) {
      return;
    }

    try {
      const status = await this.scheduler.getJobStatus(job.externalSchedulerId);

      // Map scheduler status to our status
      let newStatus: JobStatus = job.status;
      let eventType: JobEventType | null = null;

      if (status.status === 'RUNNING' && job.status !== 'RUNNING') {
        newStatus = 'RUNNING';
        eventType = 'STARTED';
      } else if (status.status === 'COMPLETED' && job.status !== 'COMPLETED') {
        newStatus = 'COMPLETED';
        eventType = 'COMPLETED';
      } else if (status.status === 'FAILED' && job.status !== 'FAILED') {
        newStatus = 'FAILED';
        eventType = 'FAILED';
      } else if (status.status === 'CANCELLED' && job.status !== 'CANCELLED') {
        newStatus = 'CANCELLED';
        eventType = 'CANCELLED';
      }

      if (newStatus !== job.status) {
        await this.prisma.job.update({
          where: { id: jobId },
          data: {
            status: newStatus,
            startTime: status.startTime || job.startTime,
            endTime: status.endTime || job.endTime,
            statusReason: status.reason,
          },
        });

        if (eventType) {
          await this.prisma.jobEvent.create({
            data: {
              jobId,
              type: eventType,
              message: status.reason || `Job ${eventType.toLowerCase()}`,
            },
          });
        }

        this.logger.log(`Job ${jobId} status updated to ${newStatus}`);

        // If job completed, create usage record
        if (newStatus === 'COMPLETED' && status.startTime && status.endTime) {
          await this.createUsageRecord(job, status.startTime, status.endTime);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update job ${jobId} status: ${error.message}`);
    }
  }

  private async createUsageRecord(job: any, startTime: Date, endTime: Date) {
    const runtimeSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const cpuHours = (job.nodes * job.tasks * job.cpusPerTask * runtimeSeconds) / 3600;
    const gpuHours = (job.nodes * job.gpusPerNode * runtimeSeconds) / 3600;

    await this.prisma.usageRecord.create({
      data: {
        userId: job.userId,
        jobId: job.id,
        cpuHours,
        gpuHours,
        walltimeSeconds: runtimeSeconds,
      },
    });

    this.logger.log(`Usage record created for job ${job.id}: ${cpuHours} CPU hours, ${gpuHours} GPU hours`);
  }

  async downloadOutputs(jobId: string, userId: string): Promise<{ buffer: Buffer; filename: string }> {
    const job = await this.findOne(jobId, userId);

    if (!job.workingDirectory) {
      throw new NotFoundException('Job working directory not found');
    }

    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    const buffers: Buffer[] = [];

    return new Promise(async (resolve, reject) => {
      archive.on('data', (chunk) => buffers.push(chunk));
      archive.on('end', () => {
        const buffer = Buffer.concat(buffers);
        resolve({
          buffer,
          filename: `job-${job.jobName}-${jobId}.zip`
        });
      });
      archive.on('error', (err) => reject(err));

      try {
        // Read all files in the job directory
        const files = await readdir(job.workingDirectory);

        for (const file of files) {
          const filePath = join(job.workingDirectory, file);
          const stats = await stat(filePath);

          if (stats.isFile()) {
            const content = await readFile(filePath);
            archive.append(content, { name: file });
          }
        }

        archive.finalize();
      } catch (error) {
        reject(error);
      }
    });
  }
}
