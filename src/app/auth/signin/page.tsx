'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Mail, Lock, Loader2, Chrome } from 'lucide-react';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                console.error('[SignIn] NextAuth error:', res.error);
                setError('Invalid email or password');
            } else {
                console.log('[SignIn] Sign in successful, fetching session...');
                // Get fresh session to read role
                const session = await getSession();
                const role = (session?.user as any)?.role;
                console.log('[SignIn] User role:', role);
                // Admins go directly to admin portal
                router.push(role === 'admin' ? '/admin' : '/dashboard');
                router.refresh();
            }
        } catch (err) {
            console.error('[SignIn] Unexpected error during sign in:', err);
            setError('Something went wrong. Please try again.');
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
                        <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tighter mb-2">Welcome Back</h1>
                        <p className="text-slate-500 font-medium">Inclusive tech for campus resilience</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="email"
                                    name="email"
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
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
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
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                        </button>
                    </form>

                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={() => signIn('google', { callbackUrl: '/api/auth/role-redirect' })}
                        className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all hover:bg-slate-50 active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <Chrome className="w-5 h-5" />
                        Google Account
                    </button>

                    <p className="text-center text-slate-500 text-sm mt-10 font-medium">
                        Don't have an account?{' '}
                        <Link href="/auth/signup" className="text-indigo-600 font-bold hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
