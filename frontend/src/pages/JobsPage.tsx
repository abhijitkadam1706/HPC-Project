import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';
import { Job } from '@/types';
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  PlusCircle,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
};

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await api.get('/jobs');
      return response.data;
    },
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = jobs.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your submitted jobs
          </p>
        </div>
        <Link
          to="/jobs/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> New Job
        </Link>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { key: 'ALL', label: 'All Jobs', count: jobs.length },
          { key: 'RUNNING', label: 'Running', count: statusCounts.RUNNING || 0 },
          { key: 'QUEUED', label: 'Queued', count: statusCounts.QUEUED || 0 },
          { key: 'COMPLETED', label: 'Completed', count: statusCounts.COMPLETED || 0 },
          { key: 'FAILED', label: 'Failed', count: statusCounts.FAILED || 0 },
          { key: 'CANCELLED', label: 'Cancelled', count: statusCounts.CANCELLED || 0 },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setStatusFilter(stat.key)}
            className={`p-4 rounded-lg border-2 transition-all ${
              statusFilter === stat.key
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <Button variant="secondary">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-3 text-indigo-600" />
              <p>Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <PlusCircle className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'No jobs found'
                  : 'No jobs yet'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'Submit your first HPC job to get started'}
              </p>
              {!searchTerm && statusFilter === 'ALL' && (
                <Link
                  to="/jobs/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Job
                </Link>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Job Name', 'ID', 'Status', 'Queue', 'Submitted', 'Runtime', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/jobs/${job.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {job.jobName}
                      </div>
                      {job.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {job.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {job.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.queue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.submissionTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.startTime && job.endTime
                        ? `${Math.floor(
                            (new Date(job.endTime).getTime() -
                              new Date(job.startTime).getTime()) /
                              60000
                          )}m`
                        : job.startTime
                        ? 'Running...'
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </Link>
                      {job.status === 'COMPLETED' && (
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert('Download outputs - to be implemented');
                          }}
                        >
                          <Download className="h-4 w-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredJobs.length}</span> of{' '}
              <span className="font-medium">{jobs.length}</span> jobs
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled>
                Previous
              </Button>
              <Button variant="secondary" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
