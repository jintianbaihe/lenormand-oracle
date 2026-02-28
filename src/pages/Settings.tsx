import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Camera, Save, LogOut, ChevronLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';

export const Settings = () => {
  const { t, user, updateProfile, logout } = useAppContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ username, avatar });
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm(t('logout') + '?')) {
      logout();
      navigate('/auth');
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] pb-32">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all shadow-sm dark:shadow-none"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-serif text-slate-900 dark:text-white tracking-widest uppercase opacity-80">
          {t('profileSettings')}
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="flex-1 px-6 overflow-y-auto no-scrollbar">
        <div className="max-w-md mx-auto mt-8 space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/30 shadow-xl">
                <img 
                  src={avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                onClick={() => {
                  const newSeed = Math.random().toString(36).substring(7);
                  setAvatar(`https://api.dicebear.com/7.x/shapes/svg?seed=${newSeed}&backgroundColor=0a0a1a`);
                }}
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform active:scale-90"
              >
                <Camera size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              {t('avatar')}
            </p>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold ml-1">
                {t('username')}
              </label>
              <div className="glass-morphism rounded-2xl flex items-center px-4 h-14 border border-white/10 bg-white/5 focus-within:border-indigo-500/40 transition-all shadow-sm dark:shadow-none">
                <UserIcon className="text-slate-400 mr-3" size={20} />
                <input 
                  className="bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 flex-1 text-sm" 
                  placeholder={t('username')} 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-4">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20"
              >
                <Save size={20} />
                {isSaving ? "..." : t('saveChanges')}
              </button>

              <button 
                onClick={handleLogout}
                className="w-full h-14 rounded-2xl bg-white/5 text-rose-500 font-bold flex items-center justify-center gap-2 hover:bg-rose-500/10 active:scale-[0.98] transition-all border border-white/5"
              >
                <LogOut size={20} />
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
