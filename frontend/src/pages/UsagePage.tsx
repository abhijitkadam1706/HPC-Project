import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  Download,
  Calendar,
  Cpu,
  Zap,
  DollarSign,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface UsageStats {
  cpuHours: number;
  gpuHours: number;
  totalJobs: number;
  storageGB: number;
  estimatedCost: number;
}

interface UsageHistory {
  date: string;
  cpuHours: number;
  gpuHours: number;
  jobs: number;
  cost: number;
}

// Mock data
const CURRENT_MONTH_STATS: UsageStats = {
  cpuHours: 1240.5,
  gpuHours: 89.2,
  totalJobs: 47,
  storageGB: 238.4,
  estimatedCost: 892.3,
};

const MOCK_HISTORY: UsageHistory[] = [
  { date: '2024-11-26', cpuHours: 45.2, gpuHours: 3.5, jobs: 2, cost: 32.5 },
  { date: '2024-11-25', cpuHours: 62.8, gpuHours: 8.1, jobs: 3, cost: 58.2 },
  { date: '2024-11-24', cpuHours: 38.5, gpuHours: 2.2, jobs: 2, cost: 28.1 },
  { date: '2024-11-23', cpuHours: 92.3, gpuHours: 12.4, jobs: 5, cost: 98.5 },
  { date: '2024-11-22', cpuHours: 71.2, gpuHours: 6.8, jobs: 4, cost: 65.3 },
];

export default function UsagePage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  const handleExportReport = () => {
    // TODO: Implement export functionality
    alert('Export CSV report - to be implemented');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage & Billing</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your resource consumption and estimated costs
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
          </select>
          <Button variant="secondary" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Current Month Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'CPU Hours',
            value: CURRENT_MONTH_STATS.cpuHours.toFixed(1),
            icon: Cpu,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: '+12%',
          },
          {
            label: 'GPU Hours',
            value: CURRENT_MONTH_STATS.gpuHours.toFixed(1),
            icon: Zap,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            trend: '+8%',
          },
          {
            label: 'Total Jobs',
            value: CURRENT_MONTH_STATS.totalJobs,
            icon: Activity,
            color: 'text-green-600',
            bg: 'bg-green-50',
            trend: '+5%',
          },
          {
            label: 'Estimated Cost',
            value: `$${CURRENT_MONTH_STATS.estimatedCost.toFixed(2)}`,
            icon: DollarSign,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            trend: '+10%',
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                <TrendingUp className="h-4 w-4" />
                {stat.trend}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Usage Chart Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Resource Usage Over Time</h2>
              <p className="text-sm text-gray-500">Daily breakdown of compute resources</p>
            </div>
          </div>
        </div>

        {/* Simple placeholder chart */}
        <div className="h-64 flex items-end gap-2">
          {MOCK_HISTORY.reverse().map((day, index) => {
            const maxValue = Math.max(...MOCK_HISTORY.map((d) => d.cpuHours + d.gpuHours * 10));
            const height = ((day.cpuHours + day.gpuHours * 10) / maxValue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full group">
                  <div
                    className="w-full bg-indigo-500 rounded-t-md transition-all hover:bg-indigo-600 cursor-pointer"
                    style={{ height: `${height}%`, minHeight: '20px' }}
                    title={`${day.date}: ${day.cpuHours} CPU hrs, ${day.gpuHours} GPU hrs`}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div>Date: {day.date}</div>
                    <div>CPU: {day.cpuHours}h</div>
                    <div>GPU: {day.gpuHours}h</div>
                    <div>Cost: ${day.cost}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 rotate-0">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Recent Usage History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPU Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GPU Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jobs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_HISTORY.map((record) => (
                <tr key={record.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.cpuHours.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.gpuHours.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.jobs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${record.cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">
                {CURRENT_MONTH_STATS.storageGB.toFixed(1)} GB of 500 GB used
              </span>
              <span className="text-gray-900 font-medium">
                {((CURRENT_MONTH_STATS.storageGB / 500) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${(CURRENT_MONTH_STATS.storageGB / 500) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 text-sm">
            <span className="text-gray-500">Storage is included in your plan</span>
            <Button variant="ghost" size="sm">
              Manage Files
            </Button>
          </div>
        </div>
      </div>

      {/* Billing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Billing Cycle</h3>
            <p className="text-blue-800 text-sm mb-3">
              Your current billing period: November 1 - November 30, 2024
            </p>
            <p className="text-blue-700 text-sm">
              Costs are estimated based on current usage rates. Final charges will be processed
              on December 1st.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
