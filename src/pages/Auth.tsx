import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smartphone, ShieldCheck, ArrowRight, MessageCircle, Apple, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';

export const Auth = () => {
  const { t, login } = useAppContext();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone) {
      alert(t('mobileNumber'));
      return;
    }
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(t('codeSent') || 'Code sent!');
        if (data.demoCode) {
          console.log("Demo Verification Code:", data.demoCode);
          setCode(data.demoCode); // 自动填充验证码以便演示
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to send code');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert(t('agreeTerms'));
      return;
    }
    if (!phone || !code) return;

    setIsLoading(true);
    try {
      await login(phone, code);
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-8 pt-20 pb-10 bg-midnight relative overflow-hidden">
      {/* Mystic Background Flow */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.08)_0%,transparent_50%)]" />

      <header className="text-center mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 inline-block"
        >
          <div className="w-16 h-16 rounded-2xl glass-morphism flex items-center justify-center mb-4 mx-auto border border-white/10">
            <Sparkles className="text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" size={36} />
          </div>
        </motion.div>
        <h1 className="font-serif text-4xl tracking-tight text-white mb-2 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          {t('startJourney')}
        </h1>
        <p className="text-slate-400 font-light text-sm tracking-widest uppercase">
          {t('cardsWaiting')}
        </p>
      </header>

      <main className="flex-1 max-w-sm mx-auto w-full flex flex-col gap-6">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {/* Mobile Input */}
            <div className="glass-morphism rounded-2xl flex items-center px-4 h-14 border border-white/10 focus-within:border-indigo-500/40 transition-all">
              <Smartphone className="text-slate-400 mr-3" size={20} />
              <input 
                className="bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 flex-1 text-sm" 
                placeholder={t('mobileNumber')} 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Code Input */}
            <div className="glass-morphism rounded-2xl flex items-center px-4 h-14 border border-white/10 focus-within:border-indigo-500/40 transition-all">
              <ShieldCheck className="text-slate-400 mr-3" size={20} />
              <input 
                className="bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 flex-1 text-sm" 
                placeholder={t('verificationCode')} 
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button 
                type="button"
                onClick={handleSendCode}
                className="text-indigo-400 font-semibold text-xs uppercase tracking-wider px-2 hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                {t('getCode')}
              </button>
            </div>
          </div>

          {/* Terms Agreement */}
          <label className="flex items-center gap-3 px-1 cursor-pointer group">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-0 focus:ring-offset-0 transition-all checked:shadow-[0_0_10px_rgba(99,102,241,0.6)]"
              />
            </div>
            <span className="text-xs text-slate-400 leading-tight">
              {t('agreeTerms')}
            </span>
          </label>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full h-14 rounded-2xl mt-4 flex items-center justify-center group active:scale-[0.98] transition-all relative overflow-hidden",
              "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="font-semibold text-white tracking-wide">
              {isLoading ? "..." : t('registerAndEnter')}
            </span>
            {!isLoading && <ArrowRight className="ml-2 text-xl group-hover:translate-x-1 transition-transform" size={20} />}
          </button>
        </form>
      </main>

      <footer className="mt-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">{t('orContinueWith')}</p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
        </div>

        <div className="flex justify-center gap-6">
          <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90">
            <MessageCircle className="text-emerald-400" size={24} />
          </button>
          <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90">
            <Apple className="text-white opacity-80" size={24} />
          </button>
        </div>

        {/* Decorative Bottom Bar */}
        <div className="h-1.5 w-32 bg-white/10 rounded-full mx-auto mt-10"></div>
      </footer>
    </div>
  );
};
