import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobsService } from '../services/jobs.service';
import { CreateJobDto } from '../dto/create-job.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new job' })
  async create(@Req() req: any, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(req.user.id, createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs for current user' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(@Req() req: any, @Query() query: any) {
    return this.jobsService.findAll(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.jobsService.findOne(id, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a running job' })
  async cancel(@Param('id') id: string, @Req() req: any) {
    return this.jobsService.cancel(id, req.user.id);
  }

  @Get(':id/events')
  @ApiOperation({ summary: 'Get job events' })
  async getEvents(@Param('id') id: string, @Req() req: any) {
    return this.jobsService.getEvents(id, req.user.id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get job logs' })
  @ApiQuery({ name: 'type', required: false, enum: ['stdout', 'stderr', 'scheduler'] })
  async getLogs(@Param('id') id: string, @Req() req: any, @Query('type') type?: string) {
    return this.jobsService.getLogs(id, req.user.id, type);
  }
}
