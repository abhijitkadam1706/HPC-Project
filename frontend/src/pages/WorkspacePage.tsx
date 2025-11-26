import React, { useState } from 'react';
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
  Edit3,
  Search,
  RefreshCw,
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  modified: string;
}

// Mock data - in production this would come from the API
const MOCK_FILES: FileItem[] = [
  { id: 'f1', name: 'inputs', type: 'folder', size: '-', modified: '2024-10-20' },
  { id: 'f2', name: 'results_v1', type: 'folder', size: '-', modified: '2024-10-22' },
  {
    id: 'f3',
    name: 'simulation_config.json',
    type: 'file',
    size: '4 KB',
    modified: '2024-10-24',
  },
  {
    id: 'f4',
    name: 'mesh_geometry.stl',
    type: 'file',
    size: '45 MB',
    modified: '2024-10-19',
  },
  {
    id: 'f5',
    name: 'training_script.py',
    type: 'file',
    size: '12 KB',
    modified: '2024-10-23',
  },
  {
    id: 'f6',
    name: 'job_outputs',
    type: 'folder',
    size: '-',
    modified: '2024-10-24',
  },
];

export default function WorkspacePage() {
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath] = useState(['projects', 'hpc-workspace']);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = () => {
    // TODO: Implement file upload
    alert('File upload functionality - to be implemented with API');
  };

  const handleNewFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const newFolder: FileItem = {
        id: `f${Date.now()}`,
        name: folderName,
        type: 'folder',
        size: '-',
        modified: new Date().toISOString().split('T')[0],
      };
      setFiles([newFolder, ...files]);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setFiles(files.filter((f) => f.id !== id));
    }
  };

  const handleDownload = (name: string) => {
    // TODO: Implement file download
    alert(`Download ${name} - to be implemented with API`);
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
          <Button variant="secondary" onClick={handleNewFolder}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* File Browser */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Breadcrumb */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2 text-sm text-gray-600">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          {currentPath.map((path, index) => (
            <React.Fragment key={index}>
              <span className="font-medium text-gray-900 cursor-pointer hover:text-indigo-600">
                {path}
              </span>
              {index < currentPath.length - 1 && (
                <ChevronRight className="h-4 w-4" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* File List */}
        <div className="overflow-x-auto">
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm
                      ? 'No files found matching your search'
                      : 'No files in this folder'}
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-gray-50 group transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-sm text-gray-900">
                        {file.type === 'folder' ? (
                          <Folder
                            className="h-5 w-5 text-blue-400"
                            fill="currentColor"
                          />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="font-medium cursor-pointer hover:text-indigo-600">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.modified}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {file.type === 'file' && (
                          <button
                            onClick={() => handleDownload(file.name)}
                            className="text-gray-400 hover:text-indigo-600"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => alert('Rename - to be implemented')}
                          className="text-gray-400 hover:text-indigo-600"
                          title="Rename"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id, file.name)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Storage Usage Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {filteredFiles.length} items • Storage used: 2.3 GB / 100 GB
            </span>
            <div className="flex items-center gap-2">
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: '23%' }}
                ></div>
              </div>
              <span className="text-gray-500 text-xs">23%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
