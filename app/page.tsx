'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Scene from '@/components/Scene';
import { ArrowRight, Sparkles, Shield, Zap, Calendar, Bell } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    )
    .fromTo(ctaRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
      '-=0.4'
    );

    // Feature cards animation
    const ctx = gsap.context(() => {
      gsap.fromTo('.feature-card', 
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen overflow-x-hidden">
      <Scene />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">Lumina</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/auth" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/auth?mode=signup" className="px-4 py-2 bg-white text-zinc-950 rounded-full text-sm font-semibold hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-8 flex flex-col items-center text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-8">
          <Zap className="w-3 h-3" />
          <span>New: AI-Powered Reminders</span>
        </div>
        
        <h1 ref={titleRef} className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-8 leading-[1.1]">
          Capture your thoughts in <span className="text-emerald-500">light speed.</span>
        </h1>
        
        <p ref={subtitleRef} className="text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">
          The most beautiful way to organize your life. Notes, reminders, and calendar integration wrapped in a stunning animated interface.
        </p>
        
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
          <Link href="/auth?mode=signup" className="group px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg flex items-center gap-2 hover:bg-emerald-400 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            Start Writing Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#features" className="px-8 py-4 glass text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
            Explore Features
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-8 py-32 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-display font-bold mb-4">Everything you need</h2>
          <p className="text-zinc-400">Powerful tools designed for your productivity.</p>
        </div>
        
        <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Calendar className="w-6 h-6 text-emerald-400" />}
            title="Calendar View"
            description="Organize your notes by date. See your history and plan your future with our intuitive calendar."
          />
          <FeatureCard 
            icon={<Bell className="w-6 h-6 text-emerald-400" />}
            title="Smart Reminders"
            description="Never miss a beat. Set reminders for your notes and get notified exactly when you need to."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-emerald-400" />}
            title="Secure Sync"
            description="Your data is yours. Powered by Supabase, your notes are encrypted and synced across all devices."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-white/5 text-center text-zinc-500 text-sm">
        <p>© 2026 Lumina Notes. Built with passion and light.</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="feature-card glass-card p-8 rounded-3xl will-change-transform">
      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
