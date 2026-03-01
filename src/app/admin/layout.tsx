import AdminSidebar from '@/components/admin/AdminSidebar';
import AccessibilityToolbar from '@/components/accessibility/AccessibilityToolbar';
import LearningBot from '@/components/dashboard/LearningBot';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Bell } from 'lucide-react';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    const name = session?.user?.name || 'Admin';
    const initial = name[0]?.toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />
            <main className="flex-1 ml-72 min-h-screen">
                {/* Unified header — same shape as student portal */}
                <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-40 px-10 flex items-center justify-between shadow-sm">
                    <div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                            Admin Intelligence
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <Bell className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl pl-3 pr-4 py-1.5">
                            <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-indigo-200">
                                {initial}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 leading-none">{name}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mt-0.5">Admin</p>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="p-10">
                    {children}
                </div>
            </main>
            <AccessibilityToolbar />
            <LearningBot />
        </div>
    );
}
