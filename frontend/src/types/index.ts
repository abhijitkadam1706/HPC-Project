export type Role = 'USER' | 'ADMIN';

export type JobStatus = 'SUBMITTED' | 'QUEUED' | 'RUNNING' | 'POST_PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type EnvironmentType = 'MODULES' | 'CONDA' | 'CONTAINER' | 'RAW';

export type JobType = 'SINGLE' | 'MPI' | 'ARRAY';

export interface User {
  id: string;
  name: string;
  email: string;
  organization?: string;
  role: Role;
  timezone: string;
  createdAt: string;
}

export interface Job {
  id: string;
  externalSchedulerId?: string;
  userId: string;
  jobName: string;
  description?: string;
  environmentType: EnvironmentType;
  environmentConfig: any;
  queue: string;
  jobType: JobType;
  nodes: number;
  tasks: number;
  cpusPerTask: number;
  memoryPerNodeGB: number;
  gpusPerNode: number;
  walltimeSeconds: number;
  priority: number;
  workingDirectory: string;
  command: string;
  arguments?: string;
  preJobScript?: string;
  postJobScript?: string;
  inputLocationType: string;
  inputLocationRef?: string;
  outputLocationType: string;
  outputLocationRef?: string;
  retentionPolicy: string;
  status: JobStatus;
  statusReason?: string;
  submissionTime: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  events?: JobEvent[];
}

export interface JobEvent {
  id: string;
  jobId: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  organization?: string;
  timezone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface CreateJobData {
  jobName: string;
  description?: string;
  environmentType: EnvironmentType;
  environmentConfig: any;
  queue: string;
  jobType?: JobType;
  nodes?: number;
  tasks?: number;
  cpusPerTask?: number;
  memoryPerNodeGB?: number;
  gpusPerNode?: number;
  walltimeSeconds: number;
  priority?: number;
  command: string;
  arguments?: string;
  preJobScript?: string;
  postJobScript?: string;
  inputLocationType: string;
  inputLocationRef?: string;
  outputLocationType: string;
  outputLocationRef?: string;
  retentionPolicy?: string;
}
