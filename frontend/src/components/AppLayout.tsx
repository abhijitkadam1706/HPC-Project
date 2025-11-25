import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  PlusCircle,
  Server,
  Folder,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
      active
        ? 'bg-indigo-600 text-white'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-slate-400'}`} />
    {label}
  </Link>
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white shadow-xl">
        <div className="h-16 flex items-center px-6 font-bold text-lg border-b border-slate-800">
          <Server className="h-6 w-6 text-indigo-500 mr-2" />
          HPC Portal
        </div>
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <SidebarLink to="/dashboard" icon={Home} label="Dashboard" active={isActive('/dashboard')} />
          <SidebarLink to="/jobs/new" icon={PlusCircle} label="New Job" active={isActive('/jobs/new')} />
          <SidebarLink to="/jobs" icon={Server} label="My Jobs" active={isActive('/jobs') && !isActive('/jobs/new')} />
          <SidebarLink to="/workspace" icon={Folder} label="Workspace" active={isActive('/workspace')} />
          <div className="pt-4 mt-4 border-t border-slate-800">
            <SidebarLink to="/profile" icon={Settings} label="Profile" active={isActive('/profile')} />
          </div>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-300 hover:text-red-100 hover:bg-red-900/20 rounded-md"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 text-gray-600"
            >
              <Menu />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                {user?.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="absolute inset-0 bg-slate-900 z-50 p-4 md:hidden">
            <div className="flex justify-between items-center text-white mb-8">
              <span className="font-bold text-xl">Menu</span>
              <button onClick={() => setMobileMenu(false)}>
                <X />
              </button>
            </div>
            <nav className="space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenu(false)}
                className="block w-full text-left py-3 px-4 text-white text-lg border-b border-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/jobs/new"
                onClick={() => setMobileMenu(false)}
                className="block w-full text-left py-3 px-4 text-white text-lg border-b border-slate-800"
              >
                New Job
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenu(false)}
                className="block w-full text-left py-3 px-4 text-white text-lg border-b border-slate-800"
              >
                My Jobs
              </Link>
              <Link
                to="/workspace"
                onClick={() => setMobileMenu(false)}
                className="block w-full text-left py-3 px-4 text-white text-lg border-b border-slate-800"
              >
                Workspace
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenu(false)}
                className="block w-full text-left py-3 px-4 text-white text-lg border-b border-slate-800"
              >
                Profile
              </Link>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
