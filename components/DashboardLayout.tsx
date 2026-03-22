'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/src/supabaseClient';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Moon,
  Sun,
  ChevronLeft
} from 'lucide-react';
import { gsap } from 'gsap';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('lumina-theme') as 'dark' | 'light';
      return savedTheme || 'dark';
    }
    return 'dark';
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Apply theme class on mount
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Auth check failed:', error?.message);
          // If there's a session error, clear it and redirect
          await supabase.auth.signOut();
          router.push('/auth');
          return;
        }
        
        setUser(user);
      } catch (err) {
        console.error('Unexpected auth error:', err);
        router.push('/auth');
      } finally {
        // Small delay to ensure smooth transition as requested (1s - 1.5s)
        setTimeout(() => setLoading(false), 800);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        if (!session?.user) {
          router.push('/auth');
        }
      } else if (session?.user) {
        setUser(session.user);
      }
      
      // Handle potential refresh token errors in the background
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!loading) {
      gsap.from('.sidebar-item', {
        x: -20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power3.out'
      });
    }
  }, [loading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
          <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading Lumina...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Notes', href: '/notes', icon: FileText },
    { name: 'Reminders', href: '/reminders', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('lumina-theme', newTheme);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#000000] text-white' : 'bg-zinc-50 text-zinc-900'} flex font-sans selection:bg-emerald-500/30 transition-colors duration-300`}>
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-24' : 'w-80'} ${theme === 'dark' ? 'bg-[#0B0C0B]' : 'bg-white border-r border-zinc-200'} transition-all duration-500 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 flex flex-col`}
      >
        {/* Collapse Toggle Button (Floating) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-12 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg z-50 hover:scale-110 transition-transform lg:flex hidden"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        <div className={`h-full flex flex-col ${isCollapsed ? 'px-4' : 'px-8'} py-10`}>
          {/* Logo Section */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} mb-12`}>
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="text-white w-7 h-7" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">Lumina</span>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Personal Assistant</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? (theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-emerald-50 text-emerald-600') 
                      : (theme === 'dark' ? 'text-zinc-500 hover:bg-zinc-900/50 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900')
                  }`}
                >
                  <item.icon className={`w-6 h-6 shrink-0 transition-colors ${
                    isActive ? 'text-emerald-500' : 'text-zinc-500 group-hover:text-emerald-500'
                  }`} />
                  {!isCollapsed && (
                    <span className="text-sm font-semibold tracking-tight">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
            <button 
              onClick={handleLogout}
              className={`w-full group flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3.5 rounded-xl transition-all duration-300 text-zinc-500 hover:text-red-500 hover:bg-red-500/5`}
            >
              <LogOut className="w-6 h-6 shrink-0" />
              {!isCollapsed && <span className="text-sm font-semibold tracking-tight">Logout</span>}
            </button>

            {/* Theme Toggle */}
            <div 
              onClick={toggleTheme}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} py-3.5 rounded-xl transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'bg-zinc-900/50' : 'bg-zinc-100'}`}
            >
              <div className="flex items-center gap-4">
                {theme === 'dark' ? <Moon className="w-6 h-6 text-zinc-500" /> : <Sun className="w-6 h-6 text-emerald-500" />}
                {!isCollapsed && <span className="text-sm font-semibold tracking-tight">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>}
              </div>
              {!isCollapsed && (
                <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'light' ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${theme === 'light' ? 'right-1' : 'left-1'}`} />
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 glass sticky top-0 z-40">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="text-emerald-500 w-6 h-6" />
            <span className="font-display font-bold">Lumina</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400 hover:text-white">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
