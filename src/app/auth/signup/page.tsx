'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminCode, setAdminCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, adminCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.details || data.message || 'Something went wrong');
            } else {
                // Auto login after signup
                await signIn('credentials', {
                    email,
                    password,
                    callbackUrl: '/dashboard',
                });
            }
        } catch (err) {
            setError('Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="bg-indigo-600 p-4 rounded-2xl text-white mb-6 shadow-lg shadow-indigo-100">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tighter mb-2">Create Account</h1>
                        <p className="text-slate-500 font-medium whitespace-nowrap">Join the inclusive campus community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@university.edu"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Secret Code (Optional)</label>
                            <div className="relative">
                                <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={adminCode}
                                    onChange={(e) => setAdminCode(e.target.value)}
                                    placeholder="Enter code for Admin role"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-rose-500 text-sm font-bold bg-rose-50 p-3 rounded-xl text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 group"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Join Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-sm mt-10 font-medium">
                        Already have an account?{' '}
                        <Link href="/auth/signin" className="text-indigo-600 font-bold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
