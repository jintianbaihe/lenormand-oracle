import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, ShieldCheck, ArrowRight, MessageCircle, Apple, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';

import { apiService } from '../services/apiService';

export const Auth = () => {
  const { t, login, guestLogin } = useAppContext();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!phone) {
      setError(t('mobileNumber'));
      return;
    }
    setError(null);
    if (countdown > 0) return;

    try {
      const data = await apiService.sendCode(phone);
      setCountdown(60);
      if (data.demoCode) {
        // 仅开发调试用，生产环境已禁用自动填充
        console.log("Demo Verification Code:", data.demoCode);
      }
    } catch (err: any) {
      setError(err.message || '验证码发送失败，请稍后重试');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError(t('agreeTerms'));
      return;
    }
    if (!phone) {
      setError(t('mobileNumber'));
      return;
    }
    if (!code) {
      setCodeError(true);
      setError(t('invalidCode'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setCodeError(false);
    try {
      await login(phone, code);
      navigate('/'); // 验证码正确才跳转
    } catch (err: any) {
      // 后端 401 时固定返回 "Verification code is incorrect. Please try again."
      const msg: string = err.message || '';
      if (msg.includes('Verification code is incorrect')) {
        setCodeError(true);
        setCode('');
        setError('验证码错误，请检查后重试');
      } else if (msg.includes('expired')) {
        setCodeError(true);
        setCode('');
        setError('验证码已过期，请重新获取');
      } else {
        setError(msg || t('invalidCode'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    guestLogin();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-8 pt-20 pb-10 bg-midnight relative overflow-hidden">
      {/* Mystic Background Flow */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.08)_0%,transparent_50%)]" />

      <header className="text-center mb-12 relative">
        <button 
          onClick={handleSkip}
          className="absolute top-0 right-0 text-indigo-400/60 text-xs font-bold tracking-widest uppercase hover:text-indigo-400 transition-colors"
        >
          {t('skipLogin')}
        </button>
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
            <div className={cn(
              "glass-morphism rounded-2xl flex items-center px-4 h-14 border transition-all",
              error && !phone ? "border-rose-500/50" : "border-white/10 focus-within:border-indigo-500/40"
            )}>
              <Smartphone className="text-slate-400 mr-3" size={20} />
              <input 
                className="bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 flex-1 text-sm" 
                placeholder={t('mobileNumber')} 
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                }}
              />
            </div>

            {/* Code Input */}
            <div className={cn(
              "glass-morphism rounded-2xl flex items-center px-4 h-14 border transition-all",
              codeError ? "border-rose-500/50" : "border-white/10 focus-within:border-indigo-500/40"
            )}>
              <ShieldCheck className="text-slate-400 mr-3" size={20} />
              <input 
                className="bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 flex-1 text-sm" 
                placeholder={t('verificationCode')} 
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                  setCodeError(false);
                }}
              />
              <button 
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className={cn(
                  "text-indigo-400 font-semibold text-xs uppercase tracking-wider px-2 transition-opacity whitespace-nowrap",
                  countdown > 0 ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
                )}
              >
                {countdown > 0 ? `${countdown}s` : t('getCode')}
              </button>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="space-y-4">
            <label className="flex items-center gap-3 px-1 cursor-pointer group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    setError(null);
                  }}
                  className={cn(
                    "w-5 h-5 rounded border bg-white/5 text-indigo-500 focus:ring-0 focus:ring-offset-0 transition-all checked:shadow-[0_0_10px_rgba(99,102,241,0.6)]",
                    error && !agreed ? "border-rose-500/50" : "border-white/10"
                  )}
                />
              </div>
              <span className="text-xs text-slate-400 leading-tight">
                {t('agreeTerms')}
              </span>
            </label>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-1"
                >
                  <p className="text-rose-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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