import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/lib/axios';
import { Job } from '@/types';
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  ArrowLeft,
  Download,
  Terminal,
  FileText,
  AlertCircle,
  RefreshCw,
  StopCircle,
  Cpu,
  HardDrive,
  Server,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<
    string,
    { bg: string; text: string; icon: React.ElementType }
  > = {
    SUBMITTED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
    QUEUED: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    RUNNING: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Activity },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Ban },
  };

  const style = styles[status] || styles.SUBMITTED;
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}
    >
      <Icon className="h-4 w-4" />
      {status}
    </span>
  );
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'events'>('overview');

  const { data: job, isLoading, error, refetch } = useQuery<Job>({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await api.get(`/jobs/${id}`);
      return response.data;
    },
    refetchInterval: (data) => {
      // Auto-refresh every 5 seconds if job is running or queued
      return data?.status === 'RUNNING' || data?.status === 'QUEUED' ? 5000 : false;
    },
  });

  const { data: logs } = useQuery({
    queryKey: ['job-logs', id],
    queryFn: async () => {
      const response = await api.get(`/jobs/${id}/logs`);
      return response.data;
    },
    enabled: activeTab === 'logs' && !!id,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['job-events', id],
    queryFn: async () => {
      const response = await api.get(`/jobs/${id}/events`);
      return response.data;
    },
    enabled: activeTab === 'events' && !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/jobs/${id}/cancel`);
    },
    onSuccess: () => {
      toast.success('Job cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel job');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">
            The job you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const runtime =
    job.startTime && job.endTime
      ? Math.floor((new Date(job.endTime).getTime() - new Date(job.startTime).getTime()) / 1000)
      : job.startTime
      ? Math.floor((Date.now() - new Date(job.startTime).getTime()) / 1000)
      : null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/jobs')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.jobName}</h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">Job ID: {job.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {(job.status === 'RUNNING' || job.status === 'QUEUED') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Cancel Job
            </Button>
          )}
          {job.status === 'COMPLETED' && (
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Outputs
            </Button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <StatusBadge status={job.status} />
            {job.externalSchedulerId && (
              <span className="text-sm text-gray-500 font-mono">
                Slurm ID: {job.externalSchedulerId}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Submitted</p>
              <p className="font-medium">
                {new Date(job.submissionTime).toLocaleString()}
              </p>
            </div>
            {job.startTime && (
              <div>
                <p className="text-gray-500">Started</p>
                <p className="font-medium">
                  {new Date(job.startTime).toLocaleString()}
                </p>
              </div>
            )}
            {job.endTime && (
              <div>
                <p className="text-gray-500">Ended</p>
                <p className="font-medium">
                  {new Date(job.endTime).toLocaleString()}
                </p>
              </div>
            )}
            {runtime !== null && (
              <div>
                <p className="text-gray-500">Runtime</p>
                <p className="font-medium">{formatDuration(runtime)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'logs', label: 'Logs', icon: Terminal },
            { id: 'events', label: 'Events', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon
                className={`-ml-0.5 mr-2 h-5 w-5 ${
                  activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resource Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-gray-400" />
              Resource Configuration
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Queue</dt>
                <dd className="font-medium">{job.queue}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Job Type</dt>
                <dd className="font-medium">{job.jobType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Nodes</dt>
                <dd className="font-medium">{job.nodes}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">CPUs per Task</dt>
                <dd className="font-medium">{job.cpusPerTask}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Memory per Node</dt>
                <dd className="font-medium">{job.memoryPerNodeGB} GB</dd>
              </div>
              {job.gpusPerNode > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">GPUs per Node</dt>
                  <dd className="font-medium">{job.gpusPerNode}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Walltime</dt>
                <dd className="font-medium">
                  {Math.floor(job.walltimeSeconds / 60)} minutes
                </dd>
              </div>
            </dl>
          </div>

          {/* Execution Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-gray-400" />
              Execution Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500 mb-1">Command</dt>
                <dd className="font-mono bg-gray-50 p-2 rounded">{job.command}</dd>
              </div>
              {job.arguments && (
                <div>
                  <dt className="text-gray-500 mb-1">Arguments</dt>
                  <dd className="font-mono bg-gray-50 p-2 rounded">{job.arguments}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500 mb-1">Environment Type</dt>
                <dd className="font-medium">{job.environmentType}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Working Directory</dt>
                <dd className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                  {job.workingDirectory || 'Not set'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Description */}
          {job.description && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <p className="text-gray-700">{job.description}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-slate-900 rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Job Logs
            </h3>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['job-logs', id] })}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 h-96 overflow-auto">
            {logs ? (
              <pre className="whitespace-pre-wrap">{logs}</pre>
            ) : (
              <p className="text-gray-500">No logs available yet...</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-400" />
              Job Events
            </h3>
          </div>
          <div className="overflow-x-auto">
            {events.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                <p>No events recorded yet</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event: any) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {event.eventType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {event.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
