import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useBlocker } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Share2, Brain, Sparkles, Check, AlertCircle } from 'lucide-react';
import { interpretReading, FALLBACK_INTERPRETATION } from '../services/geminiService';
import { apiService } from '../services/apiService';
import { Card, Reading } from '../types';
import { SPREAD_LAYOUTS } from '../constants';
import { cn } from '../utils';
import { useAppContext } from '../context/AppContext';
import { IconMap } from '../iconMap';

/** 占卜结果页面：展示 AI 解读并提供保存、分享功能 */
export const ReadingResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, user } = useAppContext();

  const cards = location.state?.cards as Card[];
  const layoutType = location.state?.layoutType as string || '3';
  const question = location.state?.question as string || '';

  const [interpretation, setInterpretation] = useState<any>(location.state?.interpretation || null);
  const [loading, setLoading] = useState(!location.state?.interpretation);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [reflection, setReflection] = useState('');

  // 导航守卫：未保存时拦截跳转
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        !isSaved && currentLocation.pathname !== nextLocation.pathname,
      [isSaved]
    )
  );

  useEffect(() => {
    if (!cards || cards.length === 0) { navigate('/'); return; }
    if (interpretation) { setLoading(false); return; }

    interpretReading(cards, language).then(result => {
      // 用回退内容填补 AI 可能缺失的字段
      const fallback = FALLBACK_INTERPRETATION[language];
      setInterpretation({
        title: result?.title || fallback.title,
        summary: result?.summary || fallback.summary,
        detailedAnalysis: result?.detailedAnalysis || fallback.detailedAnalysis,
        guidance: result?.guidance || fallback.guidance,
      });
    }).catch(() => {
      setInterpretation(FALLBACK_INTERPRETATION[language]);
    }).finally(() => {
      setLoading(false);
    });
  }, [cards, navigate, language]);

  const handleSave = () => {
    if (!isSaved) setShowSaveModal(true);
  };

  const confirmSave = async (autoReflection?: string) => {
    if (!interpretation) return;
    try {
      const readingData: Omit<Reading, 'id'> & { userId?: string } = {
        date: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', { month: 'long', day: 'numeric', year: 'numeric' }),
        cards,
        interpretation: interpretation.summary,
        title: interpretation.title,
        spreadType: cards.length,
        layoutType,
        question: question || undefined,
        reflection: (autoReflection !== undefined ? autoReflection : reflection).trim() || undefined,
        userId: user?.id,
      };
      await apiService.saveReading(readingData);
      setIsSaved(true);
      setShowSaveModal(false);
      // 如果是被导航守卫拦截后触发的保存，重置拦截状态
      if (blocker.state === "blocked") blocker.reset();
    } catch (error: any) {
      const msg = error.message || (language === 'cn' ? "保存失败，请稍后重试" : "Failed to save, please try again later");
      alert(msg);
    }
  };

  const handleShare = async () => {
    if (!interpretation) return;
    const shareText = `${interpretation.title}\n\n${interpretation.summary}\n\n${interpretation.guidance}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: interpretation.title, text: shareText, url: window.location.href });
      } catch { /* 用户取消分享，忽略 */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert(language === 'cn' ? "解读已复制到剪贴板" : "Interpretation copied to clipboard");
      } catch { /* 剪贴板不可用，忽略 */ }
    }
  };

  // 将标题最后一个词设为斜体，增加设计感
  const titleWords = interpretation?.title?.split(' ') || [];

  return (
    <main className="flex-1 flex flex-col px-6 pt-4 pb-32 w-full max-w-2xl mx-auto overflow-y-auto no-scrollbar">
      {/* 卡牌展示区域 */}
      <div className="relative w-full overflow-visible shrink-0 mt-4 mb-6" style={{ height: 'calc(380px * 0.55)' }}>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[380px] flex items-center justify-center scale-[0.5] min-[380px]:scale-[0.6] sm:scale-[0.75]">
          {cards.map((card, idx) => {
            const pos = SPREAD_LAYOUTS[layoutType]?.[idx] || { x: 0, y: 0 };
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
                transition={{ delay: idx * 0.1, type: "spring", damping: 20 }}
                className="absolute w-[80px] h-[120px] glass-morphism rounded-xl flex flex-col items-center justify-between py-4 card-inner-glow shadow-2xl border border-slate-200 dark:border-white/10 dark:bg-slate-900/60"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-xl" />
                <span className="text-[10px] font-bold opacity-30 z-10 text-slate-500 dark:text-slate-100">{card.id.toString().padStart(2, '0')}</span>
                <div className="text-indigo-600 dark:text-indigo-300 z-10">
                  {React.createElement(IconMap[card.icon] || Sparkles, { size: 32, strokeWidth: 1.5 })}
                </div>
                <span className="text-[8px] uppercase tracking-widest font-bold text-center px-1 z-10 leading-tight text-slate-500 dark:text-slate-100">
                  {language === 'cn' ? card.nameCn : card.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="mb-8">
            <Sparkles size={48} className="text-primary opacity-50" />
          </motion.div>
          <p className="text-indigo-300/60 text-xs uppercase tracking-[0.3em] font-bold animate-pulse">{t('consultingOracle')}</p>
        </div>
      ) : (
        <>
          {/* 解读内容卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-morphism rounded-3xl p-8 mb-8 flex-1 relative dark:bg-slate-900/60 selectable-text"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 glass-morphism rounded-full flex items-center justify-center border-indigo-500/20">
              <Brain size={20} className="text-indigo-300" />
            </div>

            <h2 className="font-serif text-3xl text-center mb-6 mt-2 text-slate-900 dark:text-white">
              {titleWords.map((word: string, i: number) =>
                i === titleWords.length - 1 ? <i key={i} className="italic">{word}</i> : word + ' '
              )}
            </h2>

            {question && (
              <div className="mb-8 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                <p className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-300/50 mb-2 font-bold">{t('whatIsOnYourMind')}</p>
                <p className="font-serif italic text-lg text-slate-800 dark:text-slate-200">"{question}"</p>
              </div>
            )}

            <div className="space-y-6 text-slate-600 dark:text-slate-300/90 leading-relaxed font-light text-sm">
              <p>{interpretation.summary}</p>
              <p>{interpretation.detailedAnalysis}</p>
              <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-300/50 mb-2 font-bold">{t('guidance')}</p>
                <p className="italic font-serif text-lg text-slate-800 dark:text-slate-200">"{interpretation.guidance}"</p>
              </div>
            </div>
          </motion.div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={cn(
                "w-full py-4 glass-morphism rounded-full flex items-center justify-center gap-2 border-indigo-200 dark:border-indigo-500/20 active:scale-95 transition-all",
                isSaved ? "bg-indigo-500/20 border-indigo-500/40" : "hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              {isSaved ? <Check size={18} className="text-indigo-600 dark:text-indigo-400" /> : <Bookmark size={18} className="text-indigo-600 dark:text-indigo-300" />}
              <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-100">
                {isSaved ? t('saved') : t('saveResult')}
              </span>
            </button>
            <button
              onClick={handleShare}
              className="w-full py-4 glass-morphism rounded-full flex items-center justify-center gap-2 border-indigo-200 dark:border-indigo-500/20 active:scale-95 transition-all hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <Share2 size={18} className="text-indigo-600 dark:text-indigo-300" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-100">{t('share')}</span>
            </button>
          </div>
        </>
      )}

      {/* 保存感悟弹窗 */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
              className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full h-full max-w-md flex flex-col px-6 pt-[calc(3rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] overflow-y-auto no-scrollbar dark:bg-transparent"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] font-bold tracking-[0.4em] text-indigo-600 dark:text-primary uppercase">
                  {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* 卡牌缩略图 */}
              <div className="relative w-full h-[180px] flex items-center justify-center scale-[0.5] min-[380px]:scale-[0.6] mb-10">
                {cards.map((card, idx) => {
                  const pos = SPREAD_LAYOUTS[layoutType]?.[idx] || { x: 0, y: 0 };
                  return (
                    <div
                      key={card.id}
                      className="absolute w-[80px] h-[120px] glass-morphism rounded-xl flex flex-col items-center justify-center gap-2 border-slate-200 dark:border-primary/20 dark:bg-slate-900/40 dark:shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
                    >
                      <div className="text-indigo-600 dark:text-indigo-300">
                        {React.createElement(IconMap[card.icon] || Sparkles, { size: 24, strokeWidth: 1.5 })}
                      </div>
                      <span className="text-[7px] uppercase tracking-widest font-bold text-slate-500 dark:text-indigo-200/60">
                        {language === 'cn' ? card.nameCn : card.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mb-8">
                <h4 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">{t('aiInterpretation')}</h4>
                <div className="glass-morphism rounded-2xl p-6 border-slate-200 dark:border-white/10 dark:bg-slate-900/40">
                  <p className="italic font-serif text-lg text-slate-700 dark:text-slate-200 leading-relaxed">"{interpretation.summary}"</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col mb-8">
                <h4 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">{t('yourReflection')}</h4>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder={t('reflectionPlaceholder')}
                  className="flex-1 w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-sm text-slate-800 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/30 transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => confirmSave()}
                  className="w-full py-4 bg-indigo-600 dark:bg-indigo-600/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white dark:text-indigo-200 border dark:border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.3)] dark:shadow-[0_0_20px_rgba(99,102,241,0.15)] active:scale-95 transition-all"
                >
                  {t('saveResult')}
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="w-full py-4 glass-morphism rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-slate-200 dark:border-white/10 active:scale-95 transition-all"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 导航拦截确认弹窗 */}
      <AnimatePresence>
        {blocker.state === "blocked" && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-midnight/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-sm glass-morphism rounded-[2.5rem] p-10 border border-indigo-500/20 bg-midnight/90 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full" />
              <div className="text-center space-y-6 relative z-10">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-indigo-500/20 rounded-full border-dashed" />
                  <div className="absolute inset-2 border border-indigo-500/10 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AlertCircle size={28} className="text-indigo-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif italic text-white tracking-wide">
                    {language === 'cn' ? '未保存结果' : 'Unsaved Result'}
                  </h3>
                  <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mx-auto" />
                </div>
                <p className="text-sm text-indigo-100/60 leading-relaxed font-light px-2">
                  {language === 'cn' ? '您还没有保存本次占卜结果，确定要离开吗？' : "You haven't saved this reading yet. Are you sure you want to leave?"}
                </p>
                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={() => confirmSave('')}
                    className="w-full py-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-indigo-500/20 active:scale-95 transition-all"
                  >
                    {language === 'cn' ? '取消并保存' : 'Cancel & Save'}
                  </button>
                  <button
                    onClick={() => blocker.proceed()}
                    className="w-full py-4 rounded-full text-rose-400/60 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-rose-400 transition-colors active:scale-95"
                  >
                    {language === 'cn' ? '确认离开' : 'Leave Anyway'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
