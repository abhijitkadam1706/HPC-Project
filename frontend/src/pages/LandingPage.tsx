import { Link } from 'react-router-dom';
import { Server, Terminal, Activity, HardDrive } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <Server className="h-6 w-6 text-indigo-600" />
            <span>HPC Cloud</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-32 text-center px-4 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6 text-slate-900">
            Run HPC workloads <br />
            <span className="text-indigo-600">without the CLI</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            A modern, web-based portal for submitting, monitoring, and managing your high-performance
            computing jobs. Compatible with Slurm and AWS Batch.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 text-base rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Terminal,
                title: 'No CLI Required',
                desc: 'Submit complex MPI jobs using intuitive web forms.',
              },
              {
                icon: Activity,
                title: 'Real-time Monitoring',
                desc: 'Watch logs and resource usage live as your job runs.',
              },
              {
                icon: HardDrive,
                title: 'Data Management',
                desc: 'Upload inputs and visualize outputs directly in the browser.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100"
              >
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

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>© 2024 HPC Cloud Services. All rights reserved.</p>
      </footer>
    </div>
  );
}
