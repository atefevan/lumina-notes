'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/src/supabaseClient';
import { 
  User, 
  Mail, 
  Camera, 
  Shield, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.from('.settings-section', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out'
      });
    }
  }, [loading]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        email: email !== user.email ? email : undefined,
        data: { full_name: fullName }
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setShowPasswordInput(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    console.log('Starting account deletion process...');
    setDeleting(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found during deletion');
        throw new Error('User not found');
      }

      console.log('Deleting user data for:', user.id);

      // 1. Delete all user data
      const { error: notesError } = await supabase
        .from('notes')
        .delete()
        .eq('user_id', user.id);
      
      if (notesError) {
        console.error('Error deleting notes:', notesError);
        throw notesError;
      }

      const { error: remindersError } = await supabase
        .from('reminders')
        .delete()
        .eq('user_id', user.id);
      
      if (remindersError) {
        console.error('Error deleting reminders:', remindersError);
        throw remindersError;
      }

      console.log('User data deleted successfully. Signing out...');

      // 2. Sign out
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        throw signOutError;
      }
      
      console.log('Sign out successful. Redirecting...');
      
      // 3. Redirect to home
      window.location.href = '/';
    } catch (err: any) {
      console.error('Account deletion failed:', err);
      setMessage({ type: 'error', text: `Failed to delete account: ${err.message}` });
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file format
    const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedFormats.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file format. Please upload a PNG, JPG, WEBP, or GIF.' });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size too large. Max size is 2MB.' });
      return;
    }

    setUpdating(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Note: Ensure 'images' bucket exists in Supabase Storage with public access
      // If RLS is enabled, you need a policy like:
      // CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket "images" not found. Please create it in your Supabase dashboard.');
        }
        if (uploadError.message.includes('row-level security') || uploadError.message.includes('Permission denied')) {
          throw new Error('Permission denied. Please ensure the "images" bucket has an RLS policy allowing authenticated uploads.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      setAvatarUrl(publicUrl);
      setMessage({ type: 'success', text: 'Avatar updated!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return null;

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-zinc-500 text-sm">Manage your account and preferences.</p>
        </div>

        {message && (
          <div className={`mb-6 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-xs font-medium">{message.text}</span>
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Left Column */}
          <div className="space-y-6 overflow-hidden flex flex-col">
            {/* Profile Section */}
            <section className="settings-section bg-[#0B0C0B] p-6 rounded-2xl border border-white/5 flex flex-col">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-zinc-500">
                <Camera className="w-4 h-4 text-emerald-500" />
                Profile
              </h2>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-[#1E1F1E] border border-white/5 overflow-hidden flex items-center justify-center text-2xl font-bold text-zinc-700">
                    {avatarUrl ? (
                      <Image 
                        src={avatarUrl} 
                        alt="Avatar" 
                        width={80} 
                        height={80} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      fullName[0] || 'U'
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                    <Camera className="text-white w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={updating} />
                  </label>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-zinc-200">{fullName || 'User'}</h3>
                  <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 2MB.</p>
                  <button className="mt-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">
                    Remove Avatar
                  </button>
                </div>
              </div>
            </section>

            {/* Account Details */}
            <section className="settings-section bg-[#0B0C0B] p-6 rounded-2xl border border-white/5 flex-1 flex flex-col">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-zinc-500">
                <User className="w-4 h-4 text-emerald-500" />
                Details
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                      <input 
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#1E1F1E] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#1E1F1E] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <button 
                    type="submit"
                    disabled={updating}
                    className="w-full py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6 overflow-hidden flex flex-col">
            {/* Security Section */}
            <section className="settings-section bg-[#0B0C0B] p-6 rounded-2xl border border-white/5 flex flex-col">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-zinc-500">
                <Shield className="w-4 h-4 text-emerald-500" />
                Security
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200">Password</h3>
                    <p className="text-[10px] text-zinc-500">Update your account password</p>
                  </div>
                  <button 
                    onClick={() => setShowPasswordInput(!showPasswordInput)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    {showPasswordInput ? 'Cancel' : 'Update'}
                  </button>
                </div>
                
                {showPasswordInput && (
                  <form onSubmit={handleUpdatePassword} className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full bg-[#1E1F1E] border border-white/5 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={updating}
                      className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Update Password
                    </button>
                  </form>
                )}
              </div>
            </section>

            {/* Danger Zone */}
            <section className="settings-section bg-[#0B0C0B] p-6 rounded-2xl border border-red-500/10 flex-1 flex flex-col">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-red-500">
                <Trash2 className="w-4 h-4" />
                Danger Zone
              </h2>
              <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-red-400">Delete Account</h3>
                <p className="text-[10px] text-zinc-500 mt-1 mb-4 flex-1">
                  Permanently remove your account and all data. This action cannot be undone.
                </p>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                  className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm bg-[#0B0C0B] border border-white/10 p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-bold mb-2">Delete Account?</h2>
              <p className="text-zinc-400 text-sm mb-6">
                This action is permanent and will remove all your data.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
