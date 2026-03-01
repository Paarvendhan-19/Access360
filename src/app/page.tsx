'use client';

import Link from 'next/link';
import { Sparkles, ShieldAlert, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative font-inter overflow-hidden">
      <div className="absolute top-6 right-6 flex items-center gap-3">
        {session ? (
          <Link href="/dashboard" className="bg-white border border-slate-200 px-6 py-2 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm">
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/auth/signin" className="text-slate-500 font-bold hover:text-slate-900 transition-colors flex items-center gap-2">
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
            <Link href="/auth/signup" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Join Now
            </Link>
          </>
        )}
      </div>

      <h1 className="text-6xl font-black text-slate-900 mb-6 font-outfit tracking-tighter">
        Access<span className="text-indigo-600">360</span>
      </h1>

      <p className="text-xl text-slate-500 mb-12 max-w-2xl font-medium leading-relaxed">
        Building **inclusive technology** that improves access, wellbeing, and resilience for every student and the wider campus community.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Student Experience */}
        <Link
          href="/dashboard?role=student"
          className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-indigo-100 group-hover:text-indigo-200 transition-colors">
            <Sparkles className="w-24 h-24 rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 font-outfit">Student Experience</h3>
            <p className="text-slate-500 font-medium mb-6 leading-relaxed">Multilingual health companions, neurodiverse-friendly tools, and wellbeing nudges.</p>
            <span className="inline-flex items-center gap-2 text-indigo-600 font-bold">
              Enter Platform →
            </span>
          </div>
        </Link>

        {/* Admin Intelligence */}
        <Link
          href="/dashboard?role=admin"
          className="group bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-300 text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-slate-800 group-hover:text-slate-700 transition-colors">
            <LayoutDashboard className="w-24 h-24 -rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="bg-slate-800 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 font-outfit">Admin & NSS Partners</h3>
            <p className="text-slate-400 font-medium mb-6 leading-relaxed">Crisis mapping with humans-in-the-loop and data-driven inclusion analytics.</p>
            <span className="inline-flex items-center gap-2 text-indigo-400 font-bold">
              View Intelligence →
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-100 w-full max-w-2xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">In partnership with</p>
        <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500 font-bold text-sm">
          <span className="hover:text-indigo-600 cursor-default transition-colors">NSS Student Volunteers</span>
          <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
          <span className="hover:text-indigo-600 cursor-default transition-colors">Campus NGO Circle</span>
          <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
          <span className="hover:text-indigo-600 cursor-default transition-colors">Digital Wellness Initiative</span>
        </div>
      </div>
    </main>
  );
}
