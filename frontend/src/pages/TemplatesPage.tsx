import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  PlusCircle,
  Edit3,
  Trash2,
  Copy,
  Clock,
  Star,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  application: string;
  environmentType: string;
  lastUsed: string;
  isGlobal: boolean;
  owner?: string;
}

// Mock data - replace with API calls
const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Python ML Training (GPU)',
    description: 'Standard template for machine learning training with GPU support',
    application: 'Python/TensorFlow',
    environmentType: 'CONDA',
    lastUsed: '2 days ago',
    isGlobal: true,
  },
  {
    id: 't2',
    name: 'CFD Simulation - OpenFOAM',
    description: 'Computational fluid dynamics simulation using OpenFOAM',
    application: 'OpenFOAM',
    environmentType: 'MODULES',
    lastUsed: '5 days ago',
    isGlobal: true,
  },
  {
    id: 't3',
    name: 'Data Processing Pipeline',
    description: 'Python-based data cleaning and transformation',
    application: 'Python/Pandas',
    environmentType: 'CONDA',
    lastUsed: '1 week ago',
    isGlobal: false,
    owner: 'You',
  },
  {
    id: 't4',
    name: 'Molecular Dynamics - GROMACS',
    description: 'High-memory molecular dynamics simulation',
    application: 'GROMACS',
    environmentType: 'CONTAINER',
    lastUsed: '2 weeks ago',
    isGlobal: true,
  },
  {
    id: 't5',
    name: 'Spark ETL Job',
    description: 'Apache Spark for large-scale data processing',
    application: 'Spark',
    environmentType: 'RAW',
    lastUsed: '3 days ago',
    isGlobal: false,
    owner: 'You',
  },
];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'my' | 'global'>('all');

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.application.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'global' && template.isGlobal) ||
      (filterType === 'my' && !template.isGlobal);

    return matchesSearch && matchesFilter;
  });

  const handleUseTemplate = (templateId: string) => {
    navigate('/jobs/new', { state: { templateId } });
    toast.success('Template loaded! Configure and submit your job.');
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate = {
      ...template,
      id: `t${Date.now()}`,
      name: `${template.name} (Copy)`,
      isGlobal: false,
      owner: 'You',
      lastUsed: 'Never',
    };
    setTemplates([newTemplate, ...templates]);
    toast.success('Template duplicated successfully');
  };

  const handleDelete = (templateId: string, templateName: string) => {
    if (confirm(`Are you sure you want to delete "${templateName}"?`)) {
      setTemplates(templates.filter((t) => t.id !== templateId));
      toast.success('Template deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Reusable configurations for common HPC workloads
          </p>
        </div>
        <Button onClick={() => navigate('/jobs/new')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Template
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'my' | 'global')}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Templates</option>
              <option value="my">My Templates</option>
              <option value="global">Global Templates</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? 'Try adjusting your search or filters'
              : 'Create your first template to get started'}
          </p>
          <Button onClick={() => navigate('/jobs/new')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{template.name}</h3>
                      {template.isGlobal && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          Global
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{template.application}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{template.lastUsed}</span>
                  </div>
                </div>

                {/* Environment Badge */}
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    {template.environmentType}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 flex items-center justify-between gap-2">
                <Button
                  onClick={() => handleUseTemplate(template.id)}
                  className="flex-1"
                >
                  Use Template
                </Button>
                <div className="flex gap-1">
                  {!template.isGlobal && (
                    <button
                      onClick={() => alert('Edit template - to be implemented')}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {!template.isGlobal && (
                    <button
                      onClick={() => handleDelete(template.id, template.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Star className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Pro Tip: Save Time with Templates
            </h3>
            <p className="text-blue-800 text-sm">
              Create templates from your frequent jobs to save configuration time. Templates
              can include environment setup, resource requirements, and command patterns.
              Share global templates with your team for consistency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
