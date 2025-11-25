import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Client as SSHClient } from 'ssh2';
import { readFileSync } from 'fs';
import { ISchedulerService, SchedulerJobStatus, QueueInfo } from '../interfaces/scheduler.interface';
import { Job, EnvironmentType } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

@Injectable()
export class SlurmSchedulerService implements ISchedulerService {
  private readonly logger = new Logger(SlurmSchedulerService.name);
  private readonly mode: 'local' | 'ssh';
  private readonly sshConfig?: {
    host: string;
    port: number;
    username: string;
    privateKey?: Buffer;
    password?: string;
  };

  constructor(private configService: ConfigService) {
    this.mode = this.configService.get<string>('SLURM_MODE') as 'local' | 'ssh' || 'local';

    if (this.mode === 'ssh') {
      const keyPath = this.configService.get<string>('SLURM_SSH_KEY_PATH');
      this.sshConfig = {
        host: this.configService.get<string>('SLURM_SSH_HOST'),
        port: parseInt(this.configService.get<string>('SLURM_SSH_PORT') || '22'),
        username: this.configService.get<string>('SLURM_SSH_USER'),
        privateKey: keyPath ? readFileSync(keyPath) : undefined,
        password: this.configService.get<string>('SLURM_SSH_PASSWORD'),
      };
    }
  }

  /**
   * Build Slurm batch script for a job
   */
  async buildJobScript(job: any): Promise<string> {
    const lines: string[] = [];

    // Shebang
    lines.push('#!/bin/bash');
    lines.push('');

    // SBATCH directives
    lines.push(`#SBATCH --job-name=${job.jobName}`);
    lines.push(`#SBATCH --partition=${job.queue}`);
    lines.push(`#SBATCH --nodes=${job.nodes}`);
    lines.push(`#SBATCH --ntasks=${job.tasks}`);
    lines.push(`#SBATCH --cpus-per-task=${job.cpusPerTask}`);
    lines.push(`#SBATCH --mem=${job.memoryPerNodeGB}G`);

    if (job.gpusPerNode > 0) {
      lines.push(`#SBATCH --gres=gpu:${job.gpusPerNode}`);
    }

    // Convert walltime from seconds to HH:MM:SS
    const hours = Math.floor(job.walltimeSeconds / 3600);
    const minutes = Math.floor((job.walltimeSeconds % 3600) / 60);
    const seconds = job.walltimeSeconds % 60;
    lines.push(`#SBATCH --time=${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

    lines.push(`#SBATCH --output=${job.workingDirectory}/slurm-%j.out`);
    lines.push(`#SBATCH --error=${job.workingDirectory}/slurm-%j.err`);

    if (job.priority) {
      lines.push(`#SBATCH --priority=${job.priority}`);
    }

    lines.push('');

    // Environment setup based on environmentType
    lines.push('# Environment Setup');
    const envConfig = typeof job.environmentConfig === 'string'
      ? JSON.parse(job.environmentConfig)
      : job.environmentConfig;

    switch (job.environmentType) {
      case 'MODULES':
        if (envConfig.modules && Array.isArray(envConfig.modules)) {
          lines.push('module purge');
          envConfig.modules.forEach((mod: string) => {
            lines.push(`module load ${mod}`);
          });
        }
        break;

      case 'CONDA':
        lines.push('source $(conda info --base)/etc/profile.d/conda.sh');
        lines.push(`conda activate ${envConfig.envName}`);
        break;

      case 'CONTAINER':
        // Singularity/Apptainer container setup
        lines.push(`export SINGULARITY_IMAGE=${envConfig.imageName}`);
        if (envConfig.bindPaths) {
          lines.push(`export SINGULARITY_BINDPATH="${envConfig.bindPaths}"`);
        }
        break;

      case 'RAW':
        if (envConfig.commands) {
          lines.push(envConfig.commands);
        }
        break;
    }

    lines.push('');

    // Pre-job script
    if (job.preJobScript) {
      lines.push('# Pre-job commands');
      lines.push(job.preJobScript);
      lines.push('');
    }

    // Change to working directory
    lines.push(`cd ${job.workingDirectory}`);
    lines.push('');

    // Main command
    lines.push('# Main job command');
    let mainCommand = job.command;
    if (job.arguments) {
      mainCommand += ` ${job.arguments}`;
    }

    // Wrap in container if needed
    if (job.environmentType === 'CONTAINER') {
      mainCommand = `singularity exec $SINGULARITY_IMAGE ${mainCommand}`;
    }

    lines.push(mainCommand);
    lines.push('');

    // Post-job script
    if (job.postJobScript) {
      lines.push('# Post-job commands');
      lines.push(job.postJobScript);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Submit job to Slurm
   */
  async submitJob(jobId: string, scriptPath: string): Promise<{ schedulerJobId: string }> {
    const command = `sbatch ${scriptPath}`;

    try {
      const output = await this.executeCommand(command);

      // Parse Slurm job ID from output
      // Expected format: "Submitted batch job 12345"
      const match = output.match(/Submitted batch job (\d+)/);
      if (!match) {
        throw new Error(`Failed to parse Slurm job ID from output: ${output}`);
      }

      const schedulerJobId = match[1];
      this.logger.log(`Job ${jobId} submitted to Slurm with ID ${schedulerJobId}`);

      return { schedulerJobId };
    } catch (error) {
      this.logger.error(`Failed to submit job ${jobId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel a running job
   */
  async cancelJob(schedulerJobId: string): Promise<void> {
    const command = `scancel ${schedulerJobId}`;

    try {
      await this.executeCommand(command);
      this.logger.log(`Job ${schedulerJobId} cancelled successfully`);
    } catch (error) {
      this.logger.error(`Failed to cancel job ${schedulerJobId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get job status from Slurm
   */
  async getJobStatus(schedulerJobId: string): Promise<SchedulerJobStatus> {
    try {
      // First try squeue (for running/queued jobs)
      const squeueCommand = `squeue -j ${schedulerJobId} --Format=State,StartTime,EndTime,ExitCode --noheader`;

      try {
        const squeueOutput = await this.executeCommand(squeueCommand);
        if (squeueOutput.trim()) {
          return this.parseSqueueOutput(squeueOutput);
        }
      } catch (error) {
        // Job not in queue, check sacct for completed jobs
      }

      // Try sacct (for completed jobs)
      const sacctCommand = `sacct -j ${schedulerJobId} --format=State,Start,End,ExitCode --noheader --parsable2`;
      const sacctOutput = await this.executeCommand(sacctCommand);

      if (!sacctOutput.trim()) {
        throw new Error(`Job ${schedulerJobId} not found in Slurm`);
      }

      return this.parseSacctOutput(sacctOutput);
    } catch (error) {
      this.logger.error(`Failed to get status for job ${schedulerJobId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * List available queues/partitions
   */
  async listQueues(): Promise<QueueInfo[]> {
    const command = 'sinfo --Format=PartitionName,StateCompact,Nodes,CPUs --noheader';

    try {
      const output = await this.executeCommand(command);
      return this.parseSinfoOutput(output);
    } catch (error) {
      this.logger.error(`Failed to list queues: ${error.message}`);
      return [];
    }
  }

  /**
   * Execute command either locally or via SSH
   */
  private async executeCommand(command: string): Promise<string> {
    if (this.mode === 'local') {
      const { stdout } = await execAsync(command);
      return stdout;
    } else {
      return this.executeSSHCommand(command);
    }
  }

  /**
   * Execute command via SSH
   */
  private async executeSSHCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const conn = new SSHClient();

      conn.on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          let stdout = '';
          let stderr = '';

          stream.on('close', (code: number) => {
            conn.end();
            if (code !== 0) {
              reject(new Error(`Command failed with code ${code}: ${stderr}`));
            } else {
              resolve(stdout);
            }
          });

          stream.on('data', (data: Buffer) => {
            stdout += data.toString();
          });

          stream.stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
          });
        });
      });

      conn.on('error', (err) => {
        reject(err);
      });

      conn.connect(this.sshConfig);
    });
  }

  /**
   * Parse squeue output
   */
  private parseSqueueOutput(output: string): SchedulerJobStatus {
    const parts = output.trim().split(/\s+/);
    const state = parts[0];

    let status: SchedulerJobStatus['status'];
    if (state.includes('RUNNING') || state === 'R') {
      status = 'RUNNING';
    } else if (state.includes('PENDING') || state === 'PD') {
      status = 'QUEUED';
    } else if (state.includes('COMPLETED') || state === 'CD') {
      status = 'COMPLETED';
    } else if (state.includes('FAILED') || state === 'F') {
      status = 'FAILED';
    } else if (state.includes('CANCELLED') || state === 'CA') {
      status = 'CANCELLED';
    } else {
      status = 'QUEUED';
    }

    return { status };
  }

  /**
   * Parse sacct output
   */
  private parseSacctOutput(output: string): SchedulerJobStatus {
    const lines = output.trim().split('\n');
    const firstLine = lines[0].split('|');

    const state = firstLine[0];
    const startTime = firstLine[1] !== 'Unknown' ? new Date(firstLine[1]) : undefined;
    const endTime = firstLine[2] !== 'Unknown' ? new Date(firstLine[2]) : undefined;
    const exitCodeStr = firstLine[3];

    let status: SchedulerJobStatus['status'];
    if (state.includes('COMPLETED')) {
      status = 'COMPLETED';
    } else if (state.includes('FAILED') || state.includes('TIMEOUT')) {
      status = 'FAILED';
    } else if (state.includes('CANCELLED')) {
      status = 'CANCELLED';
    } else if (state.includes('RUNNING')) {
      status = 'RUNNING';
    } else {
      status = 'QUEUED';
    }

    const exitCode = exitCodeStr && exitCodeStr !== '' ? parseInt(exitCodeStr.split(':')[0]) : undefined;

    return {
      status,
      startTime,
      endTime,
      exitCode,
    };
  }

  /**
   * Parse sinfo output
   */
  private parseSinfoOutput(output: string): QueueInfo[] {
    const lines = output.trim().split('\n');
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      return {
        name: parts[0],
        state: parts[1],
        nodes: parseInt(parts[2]) || 0,
        cpus: parseInt(parts[3]) || 0,
      };
    });
  }
}
