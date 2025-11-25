import { IsString, IsInt, IsEnum, IsOptional, IsJSON, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnvironmentType, JobType, InputLocationType, OutputLocationType, RetentionPolicy } from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({ example: 'ML Training Job' })
  @IsString()
  jobName: string;

  @ApiPropertyOptional({ example: 'Training ResNet-50 on ImageNet' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EnvironmentType, example: 'CONDA' })
  @IsEnum(EnvironmentType)
  environmentType: EnvironmentType;

  @ApiProperty({ example: { envName: 'pytorch_env' } })
  @IsObject()
  environmentConfig: any;

  @ApiProperty({ example: 'compute-gpu' })
  @IsString()
  queue: string;

  @ApiPropertyOptional({ enum: JobType, example: 'SINGLE', default: 'SINGLE' })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  nodes?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  tasks?: number;

  @ApiPropertyOptional({ example: 4, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cpusPerTask?: number;

  @ApiPropertyOptional({ example: 16, default: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  memoryPerNodeGB?: number;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  gpusPerNode?: number;

  @ApiProperty({ example: 3600 })
  @IsInt()
  @Min(60)
  walltimeSeconds: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiProperty({ example: 'python train.py' })
  @IsString()
  command: string;

  @ApiPropertyOptional({ example: '--epochs 100 --batch-size 32' })
  @IsOptional()
  @IsString()
  arguments?: string;

  @ApiPropertyOptional({ example: 'module load cuda/11.8' })
  @IsOptional()
  @IsString()
  preJobScript?: string;

  @ApiPropertyOptional({ example: 'echo "Job completed"' })
  @IsOptional()
  @IsString()
  postJobScript?: string;

  @ApiProperty({ enum: InputLocationType, example: 'WORKSPACE' })
  @IsEnum(InputLocationType)
  inputLocationType: InputLocationType;

  @ApiPropertyOptional({ example: '/workspace/datasets/imagenet' })
  @IsOptional()
  @IsString()
  inputLocationRef?: string;

  @ApiProperty({ enum: OutputLocationType, example: 'WORKSPACE' })
  @IsEnum(OutputLocationType)
  outputLocationType: OutputLocationType;

  @ApiPropertyOptional({ example: '/workspace/outputs/job_{id}' })
  @IsOptional()
  @IsString()
  outputLocationRef?: string;

  @ApiPropertyOptional({ enum: RetentionPolicy, example: 'DAYS_30', default: 'DAYS_30' })
  @IsOptional()
  @IsEnum(RetentionPolicy)
  retentionPolicy?: RetentionPolicy;
}
