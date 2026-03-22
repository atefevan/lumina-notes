'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/src/supabaseClient';

export default function UserAvatar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('UserAvatar auth error:', error.message);
          return;
        }
        setUser(user);
      } catch (err) {
        console.error('Unexpected error in UserAvatar:', err);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) return null;

  const getInitials = () => {
    const name = user.user_metadata?.full_name || user.email || '';
    if (!name) return '??';
    return name.slice(0, 2).toUpperCase();
  };

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="group relative w-10 h-10 rounded-full p-[2px] shrink-0 transition-transform hover:scale-105" style={{
      background: 'conic-gradient(#FBBC05 0% 25%, #EA4335 25% 50%, #34A853 50% 75%, #4285F4 75% 100%)'
    }}>
      <style jsx>{`
        @keyframes rotate-border {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .group:hover {
          animation: rotate-border 4s linear infinite;
        }
        .inner-container {
          animation: inherit;
          animation-direction: reverse;
        }
      `}</style>
      <div className="inner-container w-full h-full rounded-full bg-[#0B0C0B] flex items-center justify-center overflow-hidden p-[1px]">
        <div className="w-full h-full rounded-full overflow-hidden bg-[#0B0C0B]">
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover" 
              width={40} 
              height={40} 
              referrerPolicy="no-referrer"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs font-bold text-white tracking-wider">{getInitials()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
