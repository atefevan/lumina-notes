'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/src/supabaseClient';
import { gsap } from 'gsap';
import { Sparkles, Mail, Lock, User, Github, Chrome, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Scene from '@/components/Scene';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Clear any broken sessions on mount
    const clearBrokenSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !session.user) {
        await supabase.auth.signOut();
      }
    };
    clearBrokenSession();

    setIsLogin(mode === 'login');
    setError(null);
    setSuccessMessage(null);
  }, [mode]);

  useEffect(() => {
    gsap.fromTo('.auth-card', 
      { opacity: 0, scale: 0.98, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [isLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error('Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.');
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: username,
            },
          },
        });
        if (error) throw error;
        
        setSuccessMessage('A confirmation email has been sent to your inbox. Please verify your account.');
        setIsLogin(true);
        setPassword(''); // Clear password for security
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      <Scene />
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group z-10">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="auth-card w-full max-w-md glass-card p-8 rounded-[2.5rem] shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-zinc-400 text-sm">
            {isLogin ? 'Enter your details to access your notes' : 'Join Lumina and start organizing your life'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!isLogin && error) {
                    setError(null);
                  }
                }}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950/50 px-2 text-zinc-500 backdrop-blur-sm">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 py-3 glass rounded-xl hover:bg-white/5 transition-all text-sm font-medium"
          >
            <Chrome className="w-4 h-4" />
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3 glass rounded-xl hover:bg-white/5 transition-all text-sm font-medium">
            <Github className="w-4 h-4" />
            GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          {isLogin ? "Don&apos;t have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-400 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
