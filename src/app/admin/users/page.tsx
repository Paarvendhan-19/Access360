'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    UserCog,
    ShieldCheck,
    GraduationCap,
    Mail,
    Loader2,
    Settings,
    Search,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.users) setUsers(data.users);
        } catch (err) {
            console.error('Fetch Users Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'student' : 'admin';
        if (!confirm(`Switch this user to ${newRole} mode?`)) return;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, role: newRole })
            });
            if (res.ok) fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = users.filter(u => {
        const matchesSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || u.role === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 font-outfit tracking-tight mb-2">Campus Membership</h2>
                    <p className="text-slate-500 text-lg font-medium">Manage user accounts, administrative permissions, and inclusion defaults.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find student or admin..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white border border-slate-200 pl-11 pr-6 py-3 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all w-72"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                {['all', 'admin', 'student'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all capitalize",
                            filter === f
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                : "bg-white text-slate-500 border border-slate-100 hover:border-indigo-200"
                        )}
                    >
                        {f}s
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Identify</th>
                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Authority</th>
                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Accessibility</th>
                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center">
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
                                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Accessing User Index...</p>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-slate-400 italic font-medium font-outfit text-xl">
                                    No campus members matched your search.
                                </td>
                            </tr>
                        ) : filtered.map((u) => (
                            <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 font-bold text-indigo-600">
                                            {u.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight mb-1">{u.name || 'Anonymous User'}</p>
                                            <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                                                <Mail className="w-3 h-3" /> {u.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className={cn(
                                        "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                        u.role === 'admin'
                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    )}>
                                        {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                                        {u.role}
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex justify-center flex-wrap gap-1.5 max-w-[200px] mx-auto">
                                        {u.accessibilityPreferences?.highContrast && (
                                            <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-tighter rounded">HC</span>
                                        )}
                                        {u.accessibilityPreferences?.dyslexiaFont && (
                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[8px] font-black uppercase tracking-tighter rounded">DL</span>
                                        )}
                                        {!u.accessibilityPreferences && <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">Default</span>}
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => toggleRole(u.id, u.role)}
                                            className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                                            title="Promote/Demote"
                                        >
                                            <UserCog className="w-5 h-5" />
                                        </button>
                                        <button
                                            className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
