import React from 'react';
import { JobStatus } from '@/types';

interface BadgeProps {
  status: JobStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const styles: Record<JobStatus, string> = {
    SUBMITTED: 'bg-gray-100 text-gray-800',
    QUEUED: 'bg-yellow-100 text-yellow-800',
    RUNNING: 'bg-blue-100 text-blue-800 animate-pulse',
    POST_PROCESSING: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};
