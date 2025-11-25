this is demo design for froentend (import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, CheckCircle, Clock, AlertCircle, Home, PlusCircle, Server, 
  FileText, Folder, LogOut, Menu, X, Search, ChevronRight, Download, 
  RefreshCw, Terminal, Upload, Settings, User, HelpCircle, ChevronDown,
  Cpu, HardDrive, Zap, Trash2, Edit3, Eye, Copy, Lock, CreditCard
} from 'lucide-react';

// --- TYPES ---

type ViewState = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'forgot-password'
  | 'dashboard'
  | 'jobs'
  | 'new-job'
  | 'job-detail'
  | 'workspace'
  | 'templates'
  | 'profile'
  | 'billing'
  | 'help';

interface Job {
  id: string;
  name: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  application: string;
  queue: string;
  submissionTime: string;
  runtime?: string;
}

interface Template {
  id: string;
  name: string;
  application: string;
  lastUsed: string;
}

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  modified: string;
}

// --- MOCK DATA ---

const MOCK_USER = {
  name: 'Dr. Alex Jensen',
  email: 'alex.jensen@aerolab.org',
  organization: 'AeroSpace Dynamics Lab',
  avatar: 'AJ'
};

const MOCK_JOBS: Job[] = [
  { id: 'job-1004', name: 'Airfoil Optimization v4', status: 'RUNNING', application: 'OpenFOAM', queue: 'compute-gpu', submissionTime: '2023-10-24 09:30', runtime: '2h 15m' },
  { id: 'job-1003', name: 'DNA Sequencing Batch A', status: 'COMPLETED', application: 'GROMACS', queue: 'memory-high', submissionTime: '2023-10-23 14:20', runtime: '6h 45m' },
  { id: 'job-1002', name: 'TensorFlow Training', status: 'FAILED', application: 'TensorFlow', queue: 'gpu-h100', submissionTime: '2023-10-23 08:15', runtime: '15m' },
  { id: 'job-1001', name: 'Test Simulation', status: 'COMPLETED', application: 'Generic', queue: 'debug', submissionTime: '2023-10-22 11:00', runtime: '5m' },
  { id: 'job-1000', name: 'Climate Model Year 2050', status: 'QUEUED', application: 'CESM', queue: 'compute-std', submissionTime: '2023-10-24 10:05' },
];

const MOCK_FILES: FileItem[] = [
  { id: 'f1', name: 'inputs', type: 'folder', size: '-', modified: '2023-10-20' },
  { id: 'f2', name: 'results_v1', type: 'folder', size: '-', modified: '2023-10-22' },
  { id: 'f3', name: 'simulation_config.json', type: 'file', size: '4 KB', modified: '2023-10-24' },
  { id: 'f4', name: 'mesh_geometry.stl', type: 'file', size: '45 MB', modified: '2023-10-19' },
];

const MOCK_TEMPLATES: Template[] = [
  { id: 't1', name: 'Standard CFD Run', application: 'OpenFOAM', lastUsed: '2 days ago' },
  { id: 't2', name: 'High-Mem Protein Folding', application: 'GROMACS', lastUsed: '1 week ago' },
];

// --- COMPONENT: BUTTONS ---

const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const base = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
    danger: "bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  };
  return (
    <button className={`${base} ${(variants as any)[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- COMPONENT: LANDING PAGE ---

const LandingPage = ({ onNavigate }: { onNavigate: (v: ViewState) => void }) => (
  <div className="min-h-screen bg-white font-sans text-slate-900">
    {/* Nav */}
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <Server className="h-6 w-6 text-indigo-600" />
          <span>HPC Cloud</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('login')} className="text-sm font-medium text-slate-600 hover:text-indigo-600">Login</button>
          <Button onClick={() => onNavigate('register')}>Get Started</Button>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="py-20 lg:py-32 text-center px-4 bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6 text-slate-900">
          Run HPC workloads <br/>
          <span className="text-indigo-600">without the CLI</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          A modern, web-based portal for submitting, monitoring, and managing your high-performance computing jobs. Compatible with Slurm and AWS Batch.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => onNavigate('register')} className="px-8 py-3 text-base">Start Free Trial</Button>
          <Button variant="secondary" className="px-8 py-3 text-base">View Documentation</Button>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 bg-white px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: Terminal, title: "No CLI Required", desc: "Submit complex MPI jobs using intuitive web forms." },
            { icon: Activity, title: "Real-time Monitoring", desc: "Watch logs and resource usage live as your job runs." },
            { icon: HardDrive, title: "Data Management", desc: "Upload inputs and visualize outputs directly in the browser." }
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Steps */}
    <section className="py-20 bg-slate-900 text-white px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">How it Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="flex-1 max-w-sm p-6 bg-slate-800 rounded-xl">
            <div className="text-4xl font-bold text-indigo-400 mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Create Account</h3>
            <p className="text-slate-400">Sign up and join your organization's workspace.</p>
          </div>
          <ChevronRight className="hidden md:block text-slate-600 h-8 w-8" />
          <div className="flex-1 max-w-sm p-6 bg-slate-800 rounded-xl">
            <div className="text-4xl font-bold text-indigo-400 mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Submit Job</h3>
            <p className="text-slate-400">Select an application template and configure resources.</p>
          </div>
          <ChevronRight className="hidden md:block text-slate-600 h-8 w-8" />
          <div className="flex-1 max-w-sm p-6 bg-slate-800 rounded-xl">
            <div className="text-4xl font-bold text-indigo-400 mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Get Results</h3>
            <p className="text-slate-400">Download or visualize your data immediately.</p>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-12 bg-white border-t border-slate-200 text-center text-slate-500 text-sm">
      <p>© 2024 HPC Cloud Services. All rights reserved.</p>
      <div className="flex justify-center gap-6 mt-4">
        <span className="hover:text-indigo-600 cursor-pointer">Privacy</span>
        <span className="hover:text-indigo-600 cursor-pointer">Terms</span>
        <span className="hover:text-indigo-600 cursor-pointer">Contact</span>
      </div>
    </footer>
  </div>
);

// --- COMPONENT: AUTH PAGES ---

const AuthLayout = ({ children, title }: any) => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
        <Server className="h-7 w-7 text-white" />
      </div>
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{title}</h2>
    </div>
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {children}
      </div>
    </div>
  </div>
);

const Login = ({ onNavigate, onSuccess }: any) => (
  <AuthLayout title="Sign in to your account">
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSuccess(); }}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email address</label>
        <input type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" defaultValue="user@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" defaultValue="password" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
          <label className="ml-2 block text-sm text-gray-900">Remember me</label>
        </div>
        <div className="text-sm">
          <button type="button" onClick={() => onNavigate('forgot-password')} className="font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</button>
        </div>
      </div>
      <Button type="submit" className="w-full">Sign in</Button>
    </form>
    <div className="mt-6 text-center text-sm">
      <span className="text-gray-600">Don't have an account? </span>
      <button onClick={() => onNavigate('register')} className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</button>
    </div>
  </AuthLayout>
);

const Register = ({ onNavigate }: any) => (
  <AuthLayout title="Create your account">
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>
      <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
      <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
      <div><label className="block text-sm font-medium text-gray-700">Organization</label><input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
      <div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
      <div><label className="block text-sm font-medium text-gray-700">Confirm Password</label><input type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
      <div className="flex items-center"><input type="checkbox" required className="h-4 w-4 text-indigo-600 border-gray-300 rounded" /><label className="ml-2 block text-sm text-gray-900">I agree to the Terms</label></div>
      <Button type="submit" className="w-full">Create Account</Button>
    </form>
    <div className="mt-4 text-center text-sm"><button onClick={() => onNavigate('login')} className="font-medium text-indigo-600 hover:text-indigo-500">Already have an account? Login</button></div>
  </AuthLayout>
);

// --- COMPONENT: DASHBOARD ---

const Dashboard = ({ onNavigate, jobs }: any) => {
  const stats = [
    { name: 'Running', value: jobs.filter((j:Job) => j.status === 'RUNNING').length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Queued', value: jobs.filter((j:Job) => j.status === 'QUEUED').length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { name: 'Completed (7d)', value: jobs.filter((j:Job) => j.status === 'COMPLETED').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Failed (7d)', value: jobs.filter((j:Job) => j.status === 'FAILED').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {MOCK_USER.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Here is what's happening with your projects today.</p>
        </div>
        <Button onClick={() => onNavigate('new-job')}><PlusCircle className="mr-2 h-4 w-4" /> New Job</Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-5 flex items-center">
            <div className={`flex-shrink-0 rounded-lg p-3 ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Recent Jobs</h3>
          <button onClick={() => onNavigate('jobs')} className="text-sm text-indigo-600 hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Name', 'Status', 'Runtime', 'Submitted', 'Action'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.slice(0, 5).map((job: Job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">{job.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{job.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><Badge status={job.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.runtime || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.submissionTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => onNavigate('job-detail', job.id)} className="text-indigo-600 hover:text-indigo-900">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: NEW JOB FORM ---

const NewJob = ({ onCancel, onSubmit }: any) => {
  const [loading, setLoading] = useState(false);
  
  // Minimal form state management for demo
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onSubmit({
        id: `job-${Math.floor(Math.random()*10000)}`,
        name: (e.target as any).jobName.value,
        status: 'QUEUED',
        application: (e.target as any).application.value,
        queue: (e.target as any).partition.value,
        submissionTime: new Date().toLocaleString(),
        runtime: '-'
      });
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">New Job Submission</h1>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Basic Info */}
          <Section title="1. Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Job Name" name="jobName" required placeholder="e.g. Wing Simulation v3" />
              <Input label="Project / Tag" name="project" placeholder="e.g. Aero-2024" />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
              </div>
            </div>
          </Section>

          {/* 2. Application */}
          <Section title="2. Application & Template">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Application</label>
                <select name="application" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                  <option>OpenFOAM</option>
                  <option>GROMACS</option>
                  <option>TensorFlow</option>
                  <option>Generic (Bash)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Template</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                  <option>None / Custom</option>
                  <option>Standard CFD</option>
                  <option>High Memory ML</option>
                </select>
              </div>
            </div>
          </Section>

          {/* 3. Resources */}
          <Section title="3. Compute Resources">
             <div className="space-y-4">
               <div>
                 <span className="text-sm font-medium text-gray-700">Job Type</span>
                 <div className="mt-2 flex gap-4">
                   {['Single Node', 'Multi-node MPI', 'Array Job'].map(t => (
                     <label key={t} className="flex items-center"><input type="radio" name="jobType" className="mr-2 text-indigo-600" defaultChecked={t==='Single Node'} /> {t}</label>
                   ))}
                 </div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <Input label="Nodes" type="number" defaultValue="1" />
                 <Input label="CPUs/Task" type="number" defaultValue="4" />
                 <Input label="Memory (GB)" type="number" defaultValue="16" />
                 <Input label="GPUs" type="number" defaultValue="0" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <Input label="Walltime (min)" type="number" defaultValue="60" />
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Partition</label>
                    <select name="partition" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                      <option value="compute-std">compute-std (Standard)</option>
                      <option value="compute-gpu">compute-gpu (NVIDIA H100)</option>
                      <option value="memory-high">memory-high (1TB RAM)</option>
                    </select>
                 </div>
               </div>
             </div>
          </Section>

          {/* 4. Command */}
          <Section title="4. Execution">
             <div className="space-y-4">
                <Input label="Executable / Command" placeholder="mpirun -np 4 ./solver" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Pre-job commands</label>
                     <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 font-mono text-xs" defaultValue="module load openmpi/4.1.2" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Post-job commands</label>
                     <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 font-mono text-xs" />
                   </div>
                </div>
             </div>
          </Section>

           {/* 5. Input/Output */}
           <Section title="5. Data Management">
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Input Source</span>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center"><input type="radio" name="inputSrc" className="mr-2" /> Upload new files</label>
                    <label className="flex items-center"><input type="radio" name="inputSrc" className="mr-2" defaultChecked /> Use Workspace files</label>
                    <label className="flex items-center"><input type="radio" name="inputSrc" className="mr-2" /> S3 Bucket URI</label>
                  </div>
                </div>
                <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
                  <Button variant="secondary" size="sm" type="button">Browse Workspace</Button>
                  <p className="text-xs text-gray-500 mt-2">No files selected</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Input label="Output Folder Name" placeholder="job_output_{id}" />
                   <div>
                      <label className="block text-sm font-medium text-gray-700">Retention</label>
                      <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                        <option>30 Days</option>
                        <option>90 Days</option>
                        <option>Forever</option>
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
              <h3 className="font-bold text-lg">Job Summary</h3>
              <p className="text-slate-400 text-sm">Review your configuration</p>
            </div>
            <div className="p-4 space-y-4 text-sm">
               <div className="flex justify-between border-b pb-2">
                 <span className="text-gray-500">Est. Cost</span>
                 <span className="font-bold text-gray-900">$4.50/hr</span>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between"><span className="text-gray-500">Nodes</span><span>1</span></div>
                 <div className="flex justify-between"><span className="text-gray-500">Total CPUs</span><span>4</span></div>
                 <div className="flex justify-between"><span className="text-gray-500">Memory</span><span>16 GB</span></div>
                 <div className="flex justify-between"><span className="text-gray-500">Walltime</span><span>60m</span></div>
               </div>
               <div className="pt-2">
                 <label className="flex items-start gap-2 text-xs text-gray-600">
                   <input type="checkbox" className="mt-1" defaultChecked />
                   Email me on start/finish
                 </label>
               </div>
            </div>
            <div className="p-4 bg-gray-50 border-t">
               <Button type="submit" className="w-full flex justify-center" disabled={loading}>
                 {loading ? <RefreshCw className="animate-spin h-5 w-5" /> : 'Submit Job'}
               </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// --- COMPONENT: JOB DETAIL ---

const JobDetail = ({ jobId, onBack, jobs }: any) => {
  const [activeTab, setActiveTab] = useState('overview');
  const job = jobs.find((j:Job) => j.id === jobId);

  if (!job) return <div>Job not found</div>;

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="cursor-pointer hover:text-gray-900" onClick={onBack}>Jobs</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900">{job.id}</span>
       </div>

       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{job.name}</h1>
              <Badge status={job.status} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
               <span className="flex items-center gap-1"><Terminal className="h-4 w-4" /> {job.application}</span>
               <span className="flex items-center gap-1"><Server className="h-4 w-4" /> {job.queue}</span>
               <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Submitted: {job.submissionTime}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => alert('Clone feature')}>Clone Config</Button>
            {job.status === 'RUNNING' && <Button variant="danger">Cancel Job</Button>}
          </div>
       </div>

       {/* Tabs */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
         <div className="border-b px-6">
           <nav className="-mb-px flex space-x-8">
             {['overview', 'logs', 'outputs', 'events'].map((t) => (
               <button
                 key={t}
                 onClick={() => setActiveTab(t)}
                 className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === t ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
               >
                 {t}
               </button>
             ))}
           </nav>
         </div>
         <div className="p-6">
           {activeTab === 'overview' && (
             <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <h3 className="font-bold text-gray-900 border-b pb-2">Configuration</h3>
                 <DetailRow label="Application" value={job.application} />
                 <DetailRow label="Queue" value={job.queue} />
                 <DetailRow label="Node Count" value="1" />
                 <DetailRow label="CPUs" value="4" />
                 <DetailRow label="Memory" value="16 GB" />
               </div>
               <div className="space-y-4">
                 <h3 className="font-bold text-gray-900 border-b pb-2">Status & Limits</h3>
                 <DetailRow label="Walltime Limit" value="1h 0m" />
                 <DetailRow label="Runtime" value={job.runtime || 'Pending'} />
                 <DetailRow label="Exit Code" value={job.status === 'COMPLETED' ? '0' : '-'} />
               </div>
             </div>
           )}
           {activeTab === 'logs' && (
             <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
               <p className="text-green-400"># STDOUT LOG</p>
               <p>[INFO] Job started at {job.submissionTime}</p>
               <p>[INFO] Loading environment modules...</p>
               <p>[INFO] Initializing application {job.application}</p>
               <p>...</p>
               {job.status === 'RUNNING' && <p className="animate-pulse">_</p>}
             </div>
           )}
           {activeTab === 'outputs' && (
             <div className="space-y-4">
               <div className="flex justify-end"><Button variant="secondary" size="sm"><Download className="h-4 w-4 mr-2"/> Download All</Button></div>
               <table className="min-w-full divide-y divide-gray-200 border rounded">
                 <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Size</th><th className="px-4 py-2"></th></tr></thead>
                 <tbody>
                   <tr><td className="px-4 py-2 text-sm">output.log</td><td className="px-4 py-2 text-sm text-gray-500">12 KB</td><td className="px-4 py-2 text-right"><Button variant="ghost" size="xs">Download</Button></td></tr>
                   <tr><td className="px-4 py-2 text-sm">results.dat</td><td className="px-4 py-2 text-sm text-gray-500">1.2 GB</td><td className="px-4 py-2 text-right"><Button variant="ghost" size="xs">Download</Button></td></tr>
                 </tbody>
               </table>
             </div>
           )}
         </div>
       </div>
    </div>
  );
};

// --- COMPONENT: WORKSPACE ---

const Workspace = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
      <div className="flex gap-2">
        <Button variant="secondary"><PlusCircle className="h-4 w-4 mr-2" /> New Folder</Button>
        <Button><Upload className="h-4 w-4 mr-2" /> Upload</Button>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2 text-sm text-gray-600">
        <Home className="h-4 w-4" /> / <span className="font-medium text-gray-900">projects</span> / <span className="font-medium text-gray-900">aero-sim-2024</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modified</th>
              <th className="px-6 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MOCK_FILES.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50 group">
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3 text-sm text-gray-900">
                  {f.type === 'folder' ? <Folder className="h-5 w-5 text-blue-400" fill="currentColor" /> : <FileText className="h-5 w-5 text-gray-400" />}
                  {f.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.size}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.modified}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-gray-400 hover:text-indigo-600 mx-2"><Download className="h-4 w-4"/></button>
                  <button className="text-gray-400 hover:text-red-600 mx-2"><Trash2 className="h-4 w-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// --- COMPONENT: PROFILE ---

const Profile = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
    
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Input label="Full Name" defaultValue={MOCK_USER.name} />
         <Input label="Email" defaultValue={MOCK_USER.email} disabled />
         <Input label="Organization" defaultValue={MOCK_USER.organization} />
         <div>
           <label className="block text-sm font-medium text-gray-700">Timezone</label>
           <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"><option>UTC</option><option>EST</option><option>PST</option></select>
         </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>

    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
      <div className="space-y-4 max-w-md">
        <Input label="Current Password" type="password" />
        <Input label="New Password" type="password" />
        <Input label="Confirm New Password" type="password" />
        <Button variant="secondary">Update Password</Button>
      </div>
    </div>
  </div>
);

// --- HELPER COMPONENTS ---

const Badge = ({ status }: { status: string }) => {
  const styles: any = {
    QUEUED: 'bg-yellow-100 text-yellow-800',
    RUNNING: 'bg-blue-100 text-blue-800 animate-pulse',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
};

const Section = ({ title, children }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">{title}</h3>
    {children}
  </div>
);

const Input = ({ label, className, ...props }: any) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" {...props} />
  </div>
);

const DetailRow = ({ label, value }: any) => (
  <div className="flex justify-between border-b border-gray-100 py-2">
    <dt className="text-sm text-gray-500">{label}</dt>
    <dd className="text-sm font-medium text-gray-900">{value}</dd>
  </div>
);

// --- MAIN LAYOUT SHELL ---

const SidebarLink = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
    <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-slate-400'}`} /> {label}
  </button>
);

const AppLayout = ({ children, view, setView, onLogout }: any) => {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white shadow-xl">
        <div className="h-16 flex items-center px-6 font-bold text-lg border-b border-slate-800">
          <Server className="h-6 w-6 text-indigo-500 mr-2" /> HPC Portal
        </div>
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <SidebarLink icon={Home} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarLink icon={PlusCircle} label="New Job" active={view === 'new-job'} onClick={() => setView('new-job')} />
          <SidebarLink icon={Server} label="My Jobs" active={view.includes('job')} onClick={() => setView('jobs')} />
          <SidebarLink icon={Folder} label="Workspace" active={view === 'workspace'} onClick={() => setView('workspace')} />
          <SidebarLink icon={FileText} label="Templates" active={view === 'templates'} onClick={() => setView('templates')} />
          <div className="pt-4 mt-4 border-t border-slate-800">
             <SidebarLink icon={Settings} label="Profile" active={view === 'profile'} onClick={() => setView('profile')} />
             <SidebarLink icon={CreditCard} label="Billing" active={view === 'billing'} onClick={() => setView('billing')} />
             <SidebarLink icon={HelpCircle} label="Help" active={view === 'help'} onClick={() => setView('help')} />
          </div>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-300 hover:text-red-100 hover:bg-red-900/20 rounded-md">
            <LogOut className="mr-3 h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-4">
             <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-gray-600"><Menu/></button>
             {/* Breadcrumb Mock */}
             <div className="hidden sm:flex text-sm text-gray-500 capitalize">
               {view.replace('-', ' ')}
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">{MOCK_USER.avatar}</div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{MOCK_USER.name}</span>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="absolute inset-0 bg-slate-900 z-50 p-4 md:hidden">
            <div className="flex justify-between items-center text-white mb-8">
              <span className="font-bold text-xl">Menu</span>
              <button onClick={() => setMobileMenu(false)}><X/></button>
            </div>
            <nav className="space-y-2">
               {['dashboard','new-job','jobs','workspace','profile'].map(v => (
                 <button key={v} onClick={() => { setView(v); setMobileMenu(false); }} className="block w-full text-left py-3 px-4 text-white text-lg capitalize border-b border-slate-800">
                   {v.replace('-', ' ')}
                 </button>
               ))}
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- ROOT APP ---

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);

  const navigate = (v: ViewState, id?: string) => {
    if (id) setSelectedJobId(id);
    setView(v);
  };

  const handleCreateJob = (job: Job) => {
    setJobs([job, ...jobs]);
    navigate('job-detail', job.id);
  };

  // 1. Public Pages
  if (view === 'landing') return <LandingPage onNavigate={navigate} />;
  if (view === 'login') return <Login onNavigate={navigate} onSuccess={() => navigate('dashboard')} />;
  if (view === 'register') return <Register onNavigate={navigate} />;
  if (view === 'forgot-password') return <AuthLayout title="Reset Password"><div className="text-center text-gray-600">Check your email for instructions. <br/><button onClick={() => navigate('login')} className="text-indigo-600 mt-4 underline">Back to Login</button></div></AuthLayout>;

  // 2. Protected App
  return (
    <AppLayout view={view} setView={navigate} onLogout={() => navigate('landing')}>
      {view === 'dashboard' && <Dashboard onNavigate={navigate} jobs={jobs} />}
      {view === 'jobs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
            <Button onClick={() => navigate('new-job')}>New Job</Button>
          </div>
          {/* Reusing Dashboard Table for brevity but would normally have pagination/filters here */}
           <div className="bg-white shadow rounded-lg overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">{jobs.map(j => (
                  <tr key={j.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('job-detail', j.id)}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">{j.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{j.name}</td>
                    <td className="px-6 py-4"><Badge status={j.status} /></td>
                    <td className="px-6 py-4 text-right text-sm text-indigo-600">View</td>
                  </tr>
                ))}</tbody>
             </table>
           </div>
        </div>
      )}
      {view === 'new-job' && <NewJob onCancel={() => navigate('dashboard')} onSubmit={handleCreateJob} />}
      {view === 'job-detail' && selectedJobId && <JobDetail jobId={selectedJobId} onBack={() => navigate('jobs')} jobs={jobs} />}
      {view === 'workspace' && <Workspace />}
      {view === 'profile' && <Profile />}
      {view === 'templates' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Job Templates</h1>
          <div className="grid md:grid-cols-2 gap-4">
             {MOCK_TEMPLATES.map(t => (
               <div key={t.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                 <div>
                   <h3 className="font-bold text-gray-900">{t.name}</h3>
                   <p className="text-sm text-gray-500">App: {t.application} • Used {t.lastUsed}</p>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="ghost" size="sm"><Edit3 className="h-4 w-4" /></Button>
                   <Button size="sm">Use</Button>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}
      {(view === 'billing' || view === 'help') && (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
           <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4"><Zap className="h-8 w-8" /></div>
           <h2 className="text-xl font-bold text-gray-900">Coming Soon</h2>
           <p className="text-gray-500 max-w-md mt-2">The {view} module is currently under development. Please check back later or contact support.</p>
        </div>
      )}
    </AppLayout>
  );
}) 

this is my full project skelton (You are an expert FULL-STACK CLOUD ARCHITECT and SENIOR ENGINEER.

Your job: 
Design AND implement (at least a solid, working skeleton) a **complete web application (frontend + backend)** that provides a **GUI-based HPC job portal** for a Slurm-based AWS ParallelCluster / AWS PCS environment.

========================================================
0. STUDY OTHER HPC GUI PORTALS FIRST (INSPIRATION)
========================================================

Before designing, briefly research the UX and features of the following (or similar) products:

- Altair Access (HPC job submission portal)
- NICE EnginFrame HPC portal
- Rescale platform (cloud HPC portal)
- AWS ParallelCluster UI

Use ONLY their **public marketing pages and docs** for:
- UX patterns (how they structure dashboards, job submission forms, job lists, job details).
- Features (generic job submission, monitoring, file management, visualization).
- Terminology (“job”, “workload”, “cluster”, “queue”, “environment”).

**Do NOT copy any code or text**.
Use them as **inspiration** to design a modern, intuitive, generic HPC portal.

========================================================
1. SCOPE & GOAL
========================================================

We already have:

- An AWS PCS / AWS ParallelCluster-based HPC cluster.
- A login node with Slurm configured and working:
  - `sbatch`, `squeue`, `scancel`, `sacct` are functional.
- Shared storage visible to the cluster (e.g. `/fsx`, `/shared`, `/home`).

We need a product called **“HPC Portal”** that:

- Provides a **web GUI** for ALL types of HPC workloads:
  - Simulations (CFD, FEA, etc.)
  - ML training/inference (PyTorch, TensorFlow, etc.)
  - Data cleaning / ETL
  - Big data / analytics (Spark, Python scripts, etc.)
  - Bioinformatics, rendering, any CLI job that runs via Slurm.
- Is **job-centric** and **environment-centric** (NOT solver-specific).
- Is usable by someone who knows NOTHING about development.

Core user workflow:

1. Create account & log in.
2. Select or configure an **environment** (modules, conda, container, raw).
3. Choose compute resources (queue, CPUs, memory, GPUs, nodes, walltime).
4. Specify command/script to run (plus arguments).
5. Attach input data (upload, workspace, or S3 path).
6. Submit job.
7. Monitor status & progress (live).
8. View logs (stdout/stderr/scheduler).
9. Download outputs.
10. Manage personal files via a “Workspace” file browser.

========================================================
2. TECH STACK (MANDATORY)
========================================================

Backend:
- Language: TypeScript
- Runtime: Node.js (LTS)
- Framework: NestJS
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT-based auth (access + refresh tokens)
- Background tasks: NestJS + BullMQ (Redis) or NestJS cron for polling Slurm.
- Slurm integration:
  - Backend either:
    - Runs ON the login node and calls Slurm CLI directly, OR
    - Runs on another EC2 instance and connects via SSH to login node to run Slurm commands.

Frontend:
- Framework: React
- Language: TypeScript
- Tooling: Vite
- Routing: React Router v6+
- Styling: Tailwind CSS
- Data fetching: React Query (TanStack Query)
- Forms & validation: react-hook-form + zod
- UI components: shadcn/ui or equivalent (headless + Tailwind)
- Notifications: react-hot-toast or similar

Deployment:
- Use Docker for:
  - Backend
  - Frontend
  - PostgreSQL
  - Redis
- Use a single **docker-compose.yml** so a non-developer can:
  - Configure `.env` files
  - Run `docker compose up -d --build`
  - Get a working portal.

========================================================
3. GENERIC HPC DESIGN (NOT APPLICATION-SPECIFIC)
========================================================

Everything must be designed generically:

- Use terms: **Job / Workload / Environment / Command / Data / Queue**.
- Do NOT hardcode solver names or simulation-only language.
- Users must be equally able to:
  - Run `python train.py …`
  - Run `bash clean_data.sh …`
  - Run `spark-submit job.py`
  - Run `./mySolver -case case1`
- Support both CPU-only and GPU jobs.
- Support single-node and multi-node (MPI) jobs.
- Optionally support array jobs (for parameter sweeps).

Model environments with:

- `environmentType`:
  - MODULES (load environment modules)
  - CONDA (activate conda env)
  - CONTAINER (Singularity/Apptainer/Docker image)
  - RAW (no special setup)
- `environmentConfig`:
  - MODULES: list of modules to load.
  - CONDA: env name/path.
  - CONTAINER: image name, run options, mount points.
  - RAW: optional extra commands.

========================================================
4. DATA MODEL – PRISMA SCHEMA
========================================================

Define Prisma models (you may refine, but keep the spirit):

User:
- id
- name
- email (unique)
- passwordHash
- organization (optional)
- role (enum: USER, ADMIN)
- timezone
- defaultNotificationPreferences (JSON or separate booleans)
- createdAt, updatedAt

Session / RefreshToken:
- id
- userId
- tokenId or refreshTokenHash
- userAgent
- ipAddress
- expiresAt
- createdAt

Job:
- id (UUID)
- externalSchedulerId (Slurm job ID string)
- userId
- jobName
- description
- environmentType (enum: MODULES, CONDA, CONTAINER, RAW)
- environmentConfig (JSON)
- queue (partition name)
- jobType (enum: SINGLE, MPI, ARRAY)
- nodes
- tasks
- cpusPerTask
- memoryPerNodeGB
- gpusPerNode
- walltimeSeconds
- priority
- workingDirectory (path in shared FS, e.g. `/fsx/portal/userX/jobY`)
- command (string)
- arguments (string or JSON)
- preJobScript (text)
- postJobScript (text)
- inputLocationType (enum: UPLOAD, WORKSPACE, S3)
- inputLocationRef (string/JSON)
- outputLocationType (enum: WORKSPACE, S3)
- outputLocationRef (string/JSON)
- retentionPolicy (enum: DAYS_7, DAYS_30, DAYS_90, FOREVER)
- status (enum: SUBMITTED, QUEUED, RUNNING, POST_PROCESSING, COMPLETED, FAILED, CANCELLED)
- statusReason (string, optional)
- submissionTime
- startTime
- endTime
- createdAt, updatedAt

JobEvent:
- id
- jobId
- type (SUBMITTED, QUEUED, STARTED, UPDATED, COMPLETED, FAILED, CANCELLED)
- message
- timestamp

JobLog:
- id
- jobId
- type (STDOUT, STDERR, SCHEDULER)
- storageType (WORKSPACE, S3, INLINE)
- storageRef (path or key)
- preview (optional)

JobTemplate:
- id
- ownerId (nullable for global)
- name
- description
- environmentType
- environmentConfig (JSON)
- defaultJobConfig (JSON)
- isGlobal (boolean)
- createdAt, updatedAt

WorkspaceItem:
- id
- userId
- type (FILE, FOLDER)
- name
- parentId (nullable)
- storageType (LOCAL_FS or S3)
- storageRef (path/key)
- sizeBytes
- isFromJobOutput (boolean)
- jobId (nullable)
- createdAt, updatedAt

UsageRecord:
- id
- userId
- jobId
- cpuHours
- gpuHours
- walltimeSeconds
- createdAt

========================================================
5. BACKEND ARCHITECTURE & MODULES
========================================================

Use clean NestJS modules:

- AuthModule
- UsersModule
- EnvironmentsModule (for environment presets)
- JobsModule
- JobTemplatesModule
- WorkspaceModule
- UsageModule
- AdminModule
- SchedulerModule (Slurm integration)

Implement controllers + DTOs for:

Auth:
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/forgot-password
- POST /auth/reset-password

Users:
- GET /me
- PATCH /me
- PATCH /me/change-password
- (Admin) GET /admin/users
- (Admin) PATCH /admin/users/:id

Environments:
- GET /environments
  - Return a small list of environment presets for different use cases:
    - “Python ML (GPU)”
    - “Python data processing”
    - “C++ generic”
    - “Spark job”
- (Optional) Admin endpoints to CRUD presets.

Jobs:
- POST /jobs
  - Accept full job config (generic, not solver-specific).
  - Build a **Slurm job script**:
    - `#SBATCH` directives for queue, nodes, tasks, etc.
    - Environment setup (modules/conda/container/raw).
    - Pre-job script.
    - Command + arguments.
    - Post-job script.
  - Save script under a job folder in shared FS.
  - Call `sbatch <script>` via SchedulerService.
  - Store returned Slurm job ID.
  - Set status accordingly.
- GET /jobs (filters & pagination: status, date range, search, etc.)
- GET /jobs/:id
- POST /jobs/:id/cancel
- POST /jobs/:id/rerun (clone config)
- GET /jobs/:id/events
- GET /jobs/:id/logs?type=stdout|stderr|scheduler
- GET /jobs/:id/outputs (list output files mapped to WorkspaceItem)

JobTemplates:
- CRUD endpoints to manage generic templates.

Workspace:
- GET /workspace?parentId=...
- POST /workspace/folders
- POST /workspace/files/upload-url (for presigned S3 or FS upload)
- DELETE /workspace/items/:id
- PATCH /workspace/items/:id (rename/move)
- GET /workspace/items/:id/download-url

Usage:
- GET /usage/summary
- GET /usage/history

Admin:
- GET /admin/jobs (all jobs)
- GET /admin/cluster (basic queues/node summary via Slurm)

========================================================
6. SCHEDULER SERVICE (SLURM)
========================================================

Design a `SchedulerService` interface and `SlurmSchedulerService` implementation.

Interface methods:
- `submitJob(job: Job): Promise<{ schedulerJobId: string }>`
- `cancelJob(schedulerJobId: string): Promise<void>`
- `getJobStatus(schedulerJobId: string): Promise<SchedulerJobStatus>`
- `listQueues(): Promise<QueueInfo[]>` (optional)
- (optional) `getResourceUsage(schedulerJobId: string)`

`SchedulerJobStatus`:
- status (QUEUED/RUNNING/COMPLETED/FAILED/CANCELLED)
- startTime, endTime
- exitCode
- reason / errorMessage (if any)

Implementation:

- **Local mode**:
  - Runs commands LITERALLY like:
    - `sbatch /path/to/script.sh`
    - `squeue -j <jobId> --Format=...`
    - `sacct -j <jobId> --format=...`
  - Parse text output to structured objects.

- **SSH mode**:
  - Use an SSH library to run the same commands on a remote login node.

Show concrete TypeScript code snippets for:
- Building a Slurm script string.
- Writing script to disk.
- Running `sbatch` and extracting job ID.
- Running `squeue/sacct` and mapping to our `Job.status`.

========================================================
7. BACKGROUND WORKERS (JOB POLLING & RETENTION)
========================================================

Use BullMQ or NestJS cron jobs:

1. Job Poller:
   - Every 30–60 seconds:
     - Find jobs with status SUBMITTED/QUEUED/RUNNING.
     - Call `getJobStatus` for each.
     - Update Job status fields.
     - Insert JobEvent on status changes.
     - When job ends (COMPLETED/FAILED):
       - Capture resource usage (if possible) → UsageRecord.
       - Make sure log files are accessible and Workspace entries are created for output folders.
       - Trigger notifications (stub email sender is enough).

2. Retention Cleaner:
   - Periodically check jobs older than retentionPolicy.
   - Delete/mark outputs & clean up WorkspaceItem entries.

========================================================
8. FRONTEND ARCHITECTURE & PAGES
========================================================

Use React + Vite + Tailwind, with React Query.

Routing (React Router v6):

Public routes:
- `/` → Landing page (simple marketing, call-to-action to Register/Login)
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password/:token`

Protected routes:
- `/dashboard`
- `/jobs`
- `/jobs/new`
- `/jobs/:id`
- `/templates`
- `/templates/:id`
- `/workspace`
- `/profile`
- `/billing`
- `/help`
- `/admin` (only ADMIN)
  - `/admin/users`
  - `/admin/jobs`

Overall layout:
- Top nav or sidebar inspired by portals like Altair Access / EnginFrame / Rescale:
  - Links: Dashboard, New Job, Jobs, Workspace, Templates, Billing, Help.
  - User menu: Profile, Admin (if applicable), Logout.
- Responsive design: collapsible menu on small screens.

Key pages to implement with actual TSX:

Dashboard:
- Welcome header.
- Quick stats: Running / Queued / Completed / Failed (last 7 days).
- Recent jobs table with status badges and actions.

New Job:
- Multi-section generic form:
  - Basic Info (name, description).
  - Environment:
    - Choose preset from `GET /environments`, OR custom:
      - environmentType (MODULES/CONDA/CONTAINER/RAW)
      - environmentConfig fields (modules, env name, container image, etc.).
  - Resources:
    - Queue/partition, nodes, tasks, cpusPerTask, memory, GPUs, walltime, priority.
  - Command:
    - Main command string (e.g., `python`, `bash`, `spark-submit`, `./binary`).
    - Arguments string/textarea.
    - Pre-job script, Post-job script (textareas).
  - Input:
    - Radio: Upload / Workspace / S3 path.
    - Appropriate controls for each.
  - Output & Retention:
    - Workspace folder or S3 path.
    - Retention policy dropdown.
  - Notifications:
    - Email on start/complete/fail.
  - Buttons:
    - Submit Job (calls POST /jobs).
    - Save as Template.
    - Reset / Cancel.
- Use `react-hook-form` + `zod` for validation.

Jobs List:
- Filters:
  - Search by name/ID.
  - Status multiselect.
  - Date range.
- Table:
  - Job ID, Name, Status, Queue, Submission time, Runtime, Actions (View, Logs, Cancel etc.).
- Pagination controls.

Job Details:
- Header:
  - Status badge, times, main actions.
- Tabs (Overview, Logs, Outputs, Events, Usage):
  - Overview: show environment, resources, command, input/output info.
  - Logs: stdout/stderr/scheduler with auto-refresh and download button.
  - Outputs: file list (from `/jobs/:id/outputs`) with download links, preview for small text.
  - Events: timeline of JobEvents.
  - Usage: simple metrics (cpuHours/gpuHours/walltime) if available.

Workspace:
- File browser UI:
  - Breadcrumb navigation.
  - Table/grid of files & folders with icons.
  - Actions:
    - Upload (using upload-url endpoint).
    - New Folder.
    - Download.
    - Rename.
    - Delete.
- Integrate with job outputs: allow user to see which job produced a folder.

Templates:
- List templates with:
  - Name, Description, EnvironmentType, last used, actions.
- Edit/Create Template using same form structure as New Job.
- “Use Template” → prefill New Job form.

Profile:
- Edit name, organization, timezone.
- Notification defaults.
- Change password section.

Billing / Usage:
- Show summary based on `/usage/summary` and `/usage/history`:
  - CPU hours, GPU hours, jobs count, etc.

Help:
- Simple FAQ: how to submit job, how to check logs, how to download outputs.

Auth & Guard:
- Implement AuthContext or store:
  - Holds current user and token.
  - Provides login, logout, refresh.
- ProtectedRoute/RequireAuth:
  - Redirects to `/login` if not authenticated.
- Use React Query to fetch `/me`, `/jobs`, etc.

========================================================
9. DOCKER, COMPOSE & DEPLOYMENT (FOR NON-DEVELOPER)
========================================================

Provide:

- Backend Dockerfile:
  - Build NestJS app with Prisma.
- Frontend Dockerfile:
  - Build React app with Vite, serve with nginx or node.
- docker-compose.yml:
  - Services:
    - postgres
    - redis
    - backend
    - frontend
  - Networks & volumes.
  - Health checks if possible.

Env files:

- `.env.backend.example`:
  - DB connection details.
  - JWT secrets.
  - SLURM_MODE (local or ssh).
  - SLURM_SSH_HOST, SLURM_SSH_USER, SLURM_SSH_KEY_PATH (if ssh).
  - WORKSPACE_ROOT path (shared FS root).
  - Other relevant settings.

- `.env.frontend.example`:
  - API base URL.

Step-by-step deployment (for a total beginner):

1. Install:
   - git
   - docker
   - docker compose (v2)
2. Commands:
   - `git clone <repo-url>`
   - `cd <repo>`
   - `cp .env.backend.example .env.backend` and edit.
   - `cp .env.frontend.example .env.frontend` and edit.
   - `docker compose up -d --build`
3. Open browser at `http://<server-address>/` to access portal.

Explain:

- Running backend ON login node vs connecting BY SSH.
- Where job scripts and outputs live in the filesystem.
- How to run Prisma migrations (e.g. `npx prisma migrate deploy` inside backend container).
- How to bootstrap first ADMIN user (CLI script or special endpoint).

========================================================
10. OUTPUT FORMAT FOR YOUR ANSWER
========================================================

In your answer, please:

1. Start with a **high-level architecture overview** (inspired by Altair Access / EnginFrame / Rescale / AWS PCUI, but generic).
2. Show the **backend**:
   - Folder structure.
   - Full Prisma schema.
   - NestJS modules & key services (AuthService, JobsService, SchedulerService).
   - Example controllers for /auth and /jobs.
   - Example implementation of SlurmSchedulerService.
   - Example background worker for job polling.
3. Show the **frontend**:
   - Folder structure.
   - Router setup.
   - Auth provider/store.
   - TSX examples for:
     - Dashboard
     - New Job
     - Job Details
     - Workspace
4. Show **Dockerfiles + docker-compose.yml**.
5. Provide **beginner-friendly deployment instructions** (copy-paste commands).
6. Ensure that at the end, a user can:
   - Register & login.
   - Submit a generic HPC job (e.g. `python train.py`).
   - Monitor job status.
   - View logs.
   - Download outputs.
   - See all jobs as admin.

Remember:
- This portal must support **ALL HPC workloads**, not just simulations.
- Use neutral, generic wording: Job, Workload, Environment, Command, Resources, Data.
- Take **UX inspiration** from existing HPC portals, but do NOT copy their text or code.)

  this is extra ideas and referance (# HPC Web Portal UX Patterns and Design Guide

Leading HPC job submission portals share remarkably consistent design patterns while each offering distinctive innovations. This analysis of Altair Access, NICE EnginFrame, Rescale, and AWS ParallelCluster UI reveals a mature design language for HPC interfaces that balances power-user needs with accessibility for domain scientists who simply want to run simulations.

## Common UX patterns across all portals

All four platforms converge on a **sidebar-plus-content** layout paradigm. The left sidebar serves as the primary navigation hub, organizing access to jobs, files, sessions, and administrative functions. Content areas typically present tabular data with customizable columns, while detail views expand either as side panels or dedicated pages with tabbed subsections.

**Job listing interfaces** universally employ sortable, filterable tables displaying job ID, name, status, owner, and timestamps as core columns. Status indicators use color-coded badges—green for running/completed, yellow for queued/pending, red for failed. All portals support saved filters or views, allowing users to quickly access "My Active Jobs" or "Failed This Week" without rebuilding filter criteria. Altair Access displays **50 jobs** by default with pagination, while Rescale uses infinite scroll with archived/active toggles.

**Job submission** follows two distinct models. Altair Access and EnginFrame favor **single-page forms** with a three-pane layout: application/solver selection on the left, configuration parameters in the center, and file management on the right. This approach keeps all submission context visible simultaneously. Rescale and ParallelCluster use **multi-step wizards** with explicit Next/Back navigation—Rescale's five-step flow (Input Files → Software → Hardware → Post-Processing → Review) proves particularly effective for guiding first-time users through complex cloud HPC configurations.

**Status visualization** converges on a consistent lifecycle. Jobs progress through Queued/Pending → Validating → Starting → Running → Completing → Completed/Failed states. Rescale presents this as a **visual five-stage pipeline** with checkmarks, providing immediate comprehension of where a job sits in its lifecycle. EnginFrame and Altair Access embed status in sortable table columns with icon differentiation.

The **profile/template system** appears in all portals. Users save job configurations for reuse, with two paradigms emerging: "Last Submitted" auto-profiles (Altair Access) that capture recent configurations automatically, and explicit "Save as Template" actions (Rescale, EnginFrame). This dramatically reduces submission friction for repeated workflows.

## Unique innovations from each portal

**Altair Access** introduces the most refined **progressive disclosure** for job parameters. By default, only required fields appear; a toggle labeled "Show all parameters" reveals advanced options. The "GUI" suffix convention on profiles indicates whether a saved configuration requires additional input or can submit instantly—a subtle but powerful signal for workflow automation. The **Master File Analyzer** automatically detects include files from uploaded inputs, eliminating manual dependency specification. Altair's **Zero Data Movement** architecture, where only pixels transfer for remote visualization, represents a sophisticated approach to latency-sensitive CAE workflows.

**NICE EnginFrame** (continuing as NI SP's EF Portal) distinguishes itself through its **service abstraction layer**. Administrators design user-facing submission forms using a WYSIWYG Service Editor with drag-and-drop components, hiding underlying scheduler complexity entirely. A researcher running CFD simulations sees only domain-relevant fields like "mesh file" and "turbulence model"—not Slurm directives. The **spooler** concept provides dedicated data containers per job, with **remote spoolers** extending this to S3 buckets and SSH-accessible locations. EnginFrame's **embeddable services** allow dynamic population of form fields—a "List of Available Queues" dropdown that queries the scheduler in real-time.

**Rescale** excels in **cloud-native resource selection**. Hardware options use memorable gem-stone naming (Emerald, Diamond, Nickel) rather than cryptic instance codes, with a **Coretype Explorer** providing visual comparison of memory, price, and CPU specifications. **Coretype Sets** enable automatic failover between hardware configurations when capacity is constrained. The **visual software tile interface** presents 1,250+ applications as browsable, searchable icons with clear licensing status—"Use Rescale License" versus "Bring Your Own." Rescale's **DOE (Design of Experiments)** job type natively supports parameter sweeps with template variable substitution and dry-run preview. The **Rescale Assistant** introduces AI-powered natural language querying of job data.

**AWS ParallelCluster UI** leverages the **Infrastructure as Code** paradigm most directly. Every cluster configuration exports as version-controllable YAML, enabling GitOps workflows for HPC infrastructure. The **dry-run validation** button tests configurations against AWS APIs before deployment—catching quota limits, subnet misconfigurations, and image compatibility issues. ParallelCluster's tight **CloudWatch integration** automatically creates dashboards displaying head node metrics, storage utilization, and compute node health. The distinction between **static nodes** (always-on) and **dynamic nodes** (scale-to-zero) makes autoscaling behavior explicit to users.

## Recommended terminology and labeling

Across portals, the most consistent and user-friendly terminology emerges:

| Concept | Recommended Term | Avoid |
|---------|------------------|-------|
| Submitted work unit | **Job** | Task, Workload, Run |
| Job scheduler destination | **Queue** | Partition (Slurm-specific) |
| Saved configuration | **Profile** or **Template** | Preset, Bookmark |
| Compute resource group | **Cluster** | Complex, Pool |
| Interactive GUI session | **Remote Desktop** or **Session** | View, Visualization |
| Output storage area | **Results** or **Output Directory** | Spooler (platform-specific) |

**Status labels** should use simple, verb-based states: **Queued**, **Running**, **Completed**, **Failed**, **Suspended**. Avoid CloudFormation-style compound states (CREATE_IN_PROGRESS) in user-facing interfaces—translate these to friendlier equivalents.

**Action buttons** converge on imperative verbs: **Submit**, **Cancel**, **Delete**, **Resubmit**, **Download**. For status-aware actions, use contextual labels: "Connect" for active sessions, "Restart" for suspended workstations. Secondary actions belong in dropdown menus labeled **Actions** or ellipsis (⋯) icons.

**Form field labels** should be concise with units in parentheses: "CPUs", "Memory (GB)", "Walltime (hours)". Cloud platforms should prefer user-friendly hardware names (as Rescale does) over raw instance identifiers.

## Best practices for generic HPC portal design

**Navigation architecture** should employ a persistent left sidebar with collapsible categories. Primary navigation typically includes: Jobs, Sessions/Desktops, Files, and Settings. Administrative functions belong in a separate "Admin" area or toggled view (EnginFrame's "Admin's Portal" vs "User View" pattern). Breadcrumb trails provide orientation in deep hierarchies.

**Job submission** benefits from a hybrid approach. Default to a **wizard flow** for new users with 4-5 explicit steps (Input → Software → Resources → Options → Review), but offer a "Quick Submit" mode for experienced users who can configure everything on a single page. Always provide a **review step** before submission and a **dry-run option** for validation without execution.

**Progressive disclosure** proves essential for managing complexity. Start with required fields only; reveal advanced options through expandable sections or toggle switches. Tooltips on hover should explain every non-obvious field. Default values should be sensible—Rescale pre-populates command templates, Altair uses administrator-defined defaults.

**File management** requires a built-in browser supporting:
- Drag-and-drop upload with progress indicators
- Automatic archive extraction (.zip, .tar.gz)
- Text file preview and editing
- Favorites/bookmarks for frequent locations
- Context menus for file operations (Download, Delete, "Use as Input")

**Status visualization** should be scannable at a glance. Use color-coded badges (green/yellow/red), icons for state categories, and consider Rescale's pipeline view for multi-stage lifecycle representation. Job tables should surface status, timestamps, and owner without horizontal scrolling.

**Real-time monitoring** expectations include:
- Live log tailing for running jobs (Altair's Play/Pause/Stop controls)
- Auto-refreshing job lists (30-60 second intervals)
- Resource utilization graphs (CPU, memory) for active jobs
- Notification systems for state changes (email and in-app)

**Template/profile systems** should support:
- Automatic "Last Submitted" capture
- Explicit "Save as Template" with naming
- Profile sharing within teams
- Import/export for portability

**Access control** patterns include role-based visibility (Altair's Manager/System Administrator/Application User roles), workspace isolation (Rescale's organization/workspace hierarchy), and cluster-level permissions (EnginFrame's admin-only vs shared visibility).

## Key interface elements to implement

**The job list view** forms the portal's operational hub. Essential elements include: sortable columns (ID, Name, Status, Created, Owner), multi-select checkboxes for bulk actions, a search bar filtering by ID/name/user, status filter dropdown (All, Active, Completed, Failed), and saved views in the sidebar. Row actions should include View Details, Download, Resubmit, and Delete—either as icon buttons or a kebab menu.

**The job submission form** requires: application/software selector (search-enabled dropdown or tile grid), version selector, input file upload area with drag-drop support, resource configuration fields (cores, memory, queue, walltime), an expandable advanced options section, profile save/load controls, and a prominent Submit button with optional dry-run.

**The job detail page** organizes information across tabs: Summary (metadata, resource usage, status timeline), Input Files, Output/Results (file list with download actions), and Logs (with tail/refresh for active jobs). Action buttons (Stop, Resubmit, Download All) belong in the top-right header area.

**The file browser** presents a two-pane layout: directory tree on left, file list on right. Include a location bar (editable path), file action toolbar (Upload, New Folder, Delete), search, and view toggles (list/tile). File preview should work inline for text, images, and common data formats.

**Cluster/resource management** (for cloud portals) benefits from wizard-based creation with YAML/config review before deployment, status-aware action buttons (Start/Stop/Delete), and direct links to underlying infrastructure consoles (CloudWatch, CloudFormation).

## Design principles for balancing simplicity and power

The most successful HPC portals solve the tension between accessibility and capability through **layered interfaces**. Domain scientists running standard workflows see streamlined forms with sensible defaults. Power users access full configuration through "Advanced" toggles, YAML editing, or CLI alternatives.

**Sensible defaults** reduce cognitive load dramatically. Pre-populate queue selections based on job type, suggest core counts based on application requirements, and default walltime to common values. Allow administrators to configure organization-wide defaults.

**Progressive complexity** should guide the reveal of advanced features. A new user submitting their first job shouldn't see MPI rank configurations or environment variable settings unless they expand those sections. But those options must exist and be discoverable for when they're needed.

**Immediate feedback** builds confidence. Validate inputs in real-time, provide dry-run capabilities, show estimated queue wait times where possible, and display clear error messages with actionable remediation steps.

**Keyboard accessibility and responsive design** round out modern expectations. Forms should be navigable via Tab, actions triggerable via Enter, and layouts should adapt gracefully to different viewport sizes—though HPC portal workflows remain primarily desktop-oriented.

The convergent patterns across Altair Access, EnginFrame, Rescale, and ParallelCluster UI suggest mature, user-tested designs. A generic HPC portal drawing from these patterns—wizard-based submission for beginners, power-user shortcuts for experts, robust file management, real-time monitoring, and profile-based configuration reuse—will meet expectations shaped by these market leaders.)
