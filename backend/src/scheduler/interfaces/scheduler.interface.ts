export interface SchedulerJobStatus {
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startTime?: Date;
  endTime?: Date;
  exitCode?: number;
  reason?: string;
}

export interface QueueInfo {
  name: string;
  state: string;
  nodes: number;
  cpus: number;
}

export interface ISchedulerService {
  submitJob(jobId: string, scriptPath: string): Promise<{ schedulerJobId: string }>;
  cancelJob(schedulerJobId: string): Promise<void>;
  getJobStatus(schedulerJobId: string): Promise<SchedulerJobStatus>;
  listQueues(): Promise<QueueInfo[]>;
}
