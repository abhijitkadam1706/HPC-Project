import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Section } from '@/components/ui/Section';
import { RefreshCw, Terminal, Cpu, HardDrive, Clock, Upload } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { CreateJobData, EnvironmentType, JobType } from '@/types';

export default function NewJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateJobData>>({
    jobName: '',
    description: '',
    environmentType: 'RAW',
    environmentConfig: {},
    queue: 'CPU',
    jobType: 'SINGLE',
    nodes: 1,
    tasks: 1,
    cpusPerTask: 1,
    memoryPerNodeGB: 2,
    gpusPerNode: 0,
    walltimeSeconds: 3600,
    priority: 0,
    command: '',
    arguments: '',
    preJobScript: '',
    postJobScript: '',
    inputLocationType: 'WORKSPACE',
    inputLocationRef: '',
    outputLocationType: 'WORKSPACE',
    outputLocationRef: '',
    retentionPolicy: 'DAYS_30',
  });

  // Environment config state
  const [envConfig, setEnvConfig] = useState({
    modules: '',
    condaEnv: '',
    containerImage: '',
    rawCommands: '',
  });

  const handleInputChange = (field: keyof CreateJobData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build environment config based on type
      let environmentConfig = {};
      switch (formData.environmentType) {
        case 'MODULES':
          environmentConfig = { modules: envConfig.modules.split(',').map((m) => m.trim()) };
          break;
        case 'CONDA':
          environmentConfig = { envName: envConfig.condaEnv };
          break;
        case 'CONTAINER':
          environmentConfig = { image: envConfig.containerImage };
          break;
        case 'RAW':
          environmentConfig = { commands: envConfig.rawCommands };
          break;
      }

      const submitData: CreateJobData = {
        ...formData as CreateJobData,
        environmentConfig,
      };

      const response = await api.post('/jobs', submitData);
      toast.success('Job submitted successfully!');
      navigate(`/jobs/${response.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit job');
    } finally {
      setLoading(false);
    }
  };

  const estimatedCost = (
    (formData.cpusPerTask || 0) *
    (formData.nodes || 0) *
    (formData.walltimeSeconds || 0) /
    3600 *
    0.05
  ).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Job Submission</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure and submit your HPC workload
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/jobs')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Information */}
          <Section title="1. Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Name *"
                value={formData.jobName}
                onChange={(e) => handleInputChange('jobName', e.target.value)}
                required
                placeholder="e.g., ML Training v3"
              />
              <Input
                label="Project / Tag"
                placeholder="e.g., research-2024"
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  placeholder="Brief description of your job"
                />
              </div>
            </div>
          </Section>

          {/* 2. Application & Environment */}
          <Section title="2. Application & Environment">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Environment Type *
                  </label>
                  <select
                    value={formData.environmentType}
                    onChange={(e) =>
                      handleInputChange('environmentType', e.target.value as EnvironmentType)
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="RAW">RAW (No Environment Setup)</option>
                    <option value="MODULES">Environment Modules</option>
                    <option value="CONDA">Conda Environment</option>
                    <option value="CONTAINER">Container (Singularity/Apptainer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Template
                  </label>
                  <select className="block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white focus:border-indigo-500 focus:ring-indigo-500">
                    <option>None / Custom</option>
                    <option>Python ML (GPU)</option>
                    <option>Python Data Processing</option>
                    <option>OpenFOAM CFD</option>
                    <option>GROMACS MD</option>
                  </select>
                </div>
              </div>

              {/* Environment-specific fields */}
              {formData.environmentType === 'MODULES' && (
                <Input
                  label="Modules to Load (comma-separated)"
                  value={envConfig.modules}
                  onChange={(e) => setEnvConfig({ ...envConfig, modules: e.target.value })}
                  placeholder="e.g., gcc/11.2, openmpi/4.1.2, python/3.9"
                />
              )}

              {formData.environmentType === 'CONDA' && (
                <Input
                  label="Conda Environment Name/Path"
                  value={envConfig.condaEnv}
                  onChange={(e) => setEnvConfig({ ...envConfig, condaEnv: e.target.value })}
                  placeholder="e.g., /shared/envs/myenv or myenv"
                />
              )}

              {formData.environmentType === 'CONTAINER' && (
                <Input
                  label="Container Image"
                  value={envConfig.containerImage}
                  onChange={(e) =>
                    setEnvConfig({ ...envConfig, containerImage: e.target.value })
                  }
                  placeholder="e.g., docker://tensorflow/tensorflow:latest-gpu"
                />
              )}

              {formData.environmentType === 'RAW' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raw Commands (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={envConfig.rawCommands}
                    onChange={(e) =>
                      setEnvConfig({ ...envConfig, rawCommands: e.target.value })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 font-mono text-xs focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="# Any setup commands to run before the job"
                  />
                </div>
              )}
            </div>
          </Section>

          {/* 3. Compute Resources */}
          <Section title="3. Compute Resources">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <div className="flex gap-4">
                  {[
                    { value: 'SINGLE', label: 'Single Node' },
                    { value: 'MPI', label: 'Multi-node MPI' },
                    { value: 'ARRAY', label: 'Array Job' },
                  ].map((type) => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="radio"
                        name="jobType"
                        value={type.value}
                        checked={formData.jobType === type.value}
                        onChange={(e) =>
                          handleInputChange('jobType', e.target.value as JobType)
                        }
                        className="mr-2 text-indigo-600 focus:ring-indigo-500"
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-gray-400" />
                    Nodes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.nodes}
                    onChange={(e) => handleInputChange('nodes', parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tasks/Node
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.tasks}
                    onChange={(e) => handleInputChange('tasks', parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPUs/Task
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cpusPerTask}
                    onChange={(e) =>
                      handleInputChange('cpusPerTask', parseInt(e.target.value))
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-gray-400" />
                    Memory (GB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.memoryPerNodeGB}
                    onChange={(e) =>
                      handleInputChange('memoryPerNodeGB', parseInt(e.target.value))
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPUs/Node
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.gpusPerNode}
                    onChange={(e) =>
                      handleInputChange('gpusPerNode', parseInt(e.target.value))
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    Walltime (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={(formData.walltimeSeconds || 0) / 60}
                    onChange={(e) =>
                      handleInputChange('walltimeSeconds', parseInt(e.target.value) * 60)
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partition/Queue *
                  </label>
                  <select
                    value={formData.queue}
                    onChange={(e) => handleInputChange('queue', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="CPU">CPU (Standard CPU Nodes)</option>
                    <option value="GPU">GPU (GPU Nodes)</option>
                    <option value="Memory-Optimized">Memory-Optimized (High Memory Nodes)</option>
                  </select>
                </div>
              </div>
            </div>
          </Section>

          {/* 4. Execution */}
          <Section title="4. Execution">
            <div className="space-y-4">
              <Input
                label="Command *"
                value={formData.command}
                onChange={(e) => handleInputChange('command', e.target.value)}
                placeholder="e.g., python train.py or ./mysolver or bash script.sh"
                required
              />
              <Input
                label="Arguments"
                value={formData.arguments}
                onChange={(e) => handleInputChange('arguments', e.target.value)}
                placeholder="e.g., --epochs 100 --batch-size 32"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pre-job Script (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.preJobScript}
                    onChange={(e) => handleInputChange('preJobScript', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 font-mono text-xs focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="# Commands to run before main execution"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post-job Script (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.postJobScript}
                    onChange={(e) => handleInputChange('postJobScript', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 font-mono text-xs focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="# Cleanup or post-processing commands"
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* 5. Data Management */}
          <Section title="5. Data Management">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Source
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="inputType"
                      value="UPLOAD"
                      checked={formData.inputLocationType === 'UPLOAD'}
                      onChange={(e) =>
                        handleInputChange('inputLocationType', e.target.value)
                      }
                      className="mr-2 text-indigo-600"
                    />
                    Upload new files
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="inputType"
                      value="WORKSPACE"
                      checked={formData.inputLocationType === 'WORKSPACE'}
                      onChange={(e) =>
                        handleInputChange('inputLocationType', e.target.value)
                      }
                      className="mr-2 text-indigo-600"
                    />
                    Use Workspace files
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="inputType"
                      value="S3"
                      checked={formData.inputLocationType === 'S3'}
                      onChange={(e) =>
                        handleInputChange('inputLocationType', e.target.value)
                      }
                      className="mr-2 text-indigo-600"
                    />
                    S3 Bucket URI
                  </label>
                </div>
              </div>

              {formData.inputLocationType === 'WORKSPACE' && (
                <Input
                  label="Workspace Path"
                  value={formData.inputLocationRef}
                  onChange={(e) => handleInputChange('inputLocationRef', e.target.value)}
                  placeholder="/workspace/mydata"
                />
              )}

              {formData.inputLocationType === 'S3' && (
                <Input
                  label="S3 URI"
                  value={formData.inputLocationRef}
                  onChange={(e) => handleInputChange('inputLocationRef', e.target.value)}
                  placeholder="s3://my-bucket/input-data"
                />
              )}

              {formData.inputLocationType === 'UPLOAD' && (
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <Button variant="secondary" size="sm" type="button">
                    Browse Files
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Drag and drop files here, or click to select
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Output Folder Name"
                  value={formData.outputLocationRef}
                  onChange={(e) => handleInputChange('outputLocationRef', e.target.value)}
                  placeholder="job_output_{id}"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retention Policy
                  </label>
                  <select
                    value={formData.retentionPolicy}
                    onChange={(e) => handleInputChange('retentionPolicy', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="DAYS_7">7 Days</option>
                    <option value="DAYS_30">30 Days</option>
                    <option value="DAYS_90">90 Days</option>
                    <option value="FOREVER">Forever</option>
                  </select>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                <h3 className="font-bold text-lg">Job Summary</h3>
              </div>
              <p className="text-slate-400 text-sm mt-1">Review your configuration</p>
            </div>

            <div className="p-4 space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Est. Cost</span>
                <span className="font-bold text-gray-900">${estimatedCost}/hr</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nodes</span>
                  <span className="font-medium">{formData.nodes || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total CPUs</span>
                  <span className="font-medium">
                    {(formData.nodes || 1) *
                      (formData.tasks || 1) *
                      (formData.cpusPerTask || 1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Memory</span>
                  <span className="font-medium">{formData.memoryPerNodeGB || 0} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GPUs</span>
                  <span className="font-medium">{formData.gpusPerNode || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Walltime</span>
                  <span className="font-medium">
                    {Math.floor((formData.walltimeSeconds || 0) / 60)} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Queue</span>
                  <span className="font-medium text-xs">{formData.queue}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <label className="flex items-start gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  Email me on start/finish
                </label>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t space-y-2">
              <Button type="submit" className="w-full flex justify-center" disabled={loading}>
                {loading ? (
                  <RefreshCw className="animate-spin h-5 w-5" />
                ) : (
                  'Submit Job'
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => alert('Save as template - to be implemented')}
              >
                Save as Template
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
