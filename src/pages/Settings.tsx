import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Camera, Save, LogOut, ChevronLeft, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';

export const Settings = () => {
  const { t, user, updateProfile, logout } = useAppContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/auth');
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

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm glass-morphism rounded-[2.5rem] p-10 border border-indigo-500/20 bg-midnight/90 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full" />
              
              <div className="text-center space-y-6 relative z-10">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-indigo-500/20 rounded-full border-dashed"
                  />
                  <div className="absolute inset-2 border border-indigo-500/10 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={28} className="text-indigo-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif italic text-white tracking-wide">
                    {t('logout')}
                  </h3>
                  <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mx-auto" />
                </div>

                <p className="text-sm text-indigo-100/60 leading-relaxed font-light px-2">
                  {t('logout') === '退出登录' ? '您确定要退出当前账号吗？' : 'Are you sure you want to logout?'}
                </p>

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={confirmLogout}
                    className="w-full py-4 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-rose-500/20 active:scale-95 transition-all"
                  >
                    {t('confirmAction')}
                  </button>
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full py-4 rounded-full text-indigo-300/40 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-indigo-300 transition-colors active:scale-95"
                  >
                    {t('cancelAction')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
