import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import {
  Home,
  Folder,
  FileText,
  Upload,
  PlusCircle,
  Download,
  Trash2,
  ChevronRight,
  Search,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FileItem {
  name: string;
  type: 'directory' | 'file';
  size: number;
  modified: string;
}

export default function WorkspacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const relativePath = currentPath.join('/');

  // Fetch files from API
  const { data: files = [], isLoading, refetch } = useQuery<FileItem[]>({
    queryKey: ['workspace-files', relativePath],
    queryFn: async () => {
      const response = await api.get(`/workspace/files${relativePath ? `?path=${encodeURIComponent(relativePath)}` : ''}`);
      return response.data;
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post(`/workspace/upload${relativePath ? `?path=${encodeURIComponent(relativePath)}` : ''}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Successfully uploaded ${data.uploaded.length} file(s)!`);
      refetch();
    },
    onError: () => {
      toast.error('Failed to upload files');
    },
  });

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e: any) => {
      const selectedFiles = Array.from(e.target.files || []) as File[];
      if (selectedFiles.length === 0) return;

      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('files', file));

      uploadMutation.mutate(formData);
    };
    input.click();
  };

  const handleFolderClick = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Click on "workspace" (root)
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  const handleDownload = (fileName: string) => {
    alert(`Download ${fileName} - to be implemented`);
  };

  const handleDelete = (fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
      alert(`Delete ${fileName} - to be implemented`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your files and job outputs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
            <Upload className="h-4 w-4 mr-2" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
        <Home className="h-4 w-4" />
        <button
          onClick={() => handleBreadcrumbClick(-1)}
          className="hover:text-indigo-600 font-medium"
        >
          workspace
        </button>
        {currentPath.map((segment, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4" />
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className="hover:text-indigo-600 font-medium"
            >
              {segment}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Files Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading files...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No files match your search' : 'No files in this directory'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {file.type === 'directory' ? (
                        <Folder className="h-5 w-5 text-blue-500 mr-3" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      )}
                      {file.type === 'directory' ? (
                        <button
                          onClick={() => handleFolderClick(file.name)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          {file.name}
                        </button>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {file.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(file.modified)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      {file.type === 'file' && (
                        <button
                          onClick={() => handleDownload(file.name)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(file.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
