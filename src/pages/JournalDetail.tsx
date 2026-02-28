import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Sparkles, Zap, Clover, Ship, Home, TreeDeciduous, Cloud, Snail, Skull, Flower, Sword, Flame, Bird, Baby, Ghost, Shield, Wind, Building, Palmtree, Mountain, Split, Bug, Heart, CircleDot, Book, Mail, User, Moon, Key, Fish, Anchor, Plus, Flower2 } from 'lucide-react';
import { Reading } from '../types';
import { SPREAD_LAYOUTS } from '../constants';
import { useAppContext } from '../context/AppContext';
import { cn } from '../utils';
import { apiService } from '../services/apiService';

const IconMap: Record<string, any> = {
  Zap, Clover, Ship, Home, TreeDeciduous, Cloud, Snail, Skull, Flower, Sword, Flame, Bird, Baby, Ghost, Shield, Sparkles, Wind, Heart, Building, Palmtree, Mountain, Split, Bug, CircleDot, Book, Mail, User, Moon, Key, Fish, Anchor, Plus, Flower2
};

/**
 * 日志详情页面组件
 * 负责展示单条占卜记录的详细信息，并允许用户编辑和保存感悟
 */
export const JournalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  
  // 状态管理：当前占卜记录、感悟文本
  const [reading, setReading] = useState<Reading | null>(null);
  const [reflection, setReflection] = useState('');

  // 页面加载时从后端读取对应的记录
  useEffect(() => {
    const loadReading = async () => {
      if (!id) return;
      try {
        const found = await apiService.getReadingById(id);
        setReading(found);
        setReflection(found.reflection || '');
      } catch (error) {
        console.error("Failed to load reading details:", error);
        navigate('/journal');
      }
    };
    loadReading();
  }, [id, navigate]);

  /**
   * 保存更新后的感悟
   */
  const handleSave = async () => {
    if (!reading || !id) return;
    try {
      await apiService.updateReading(id, reflection);
      // 保存后返回日志列表
      navigate('/journal');
    } catch (error) {
      console.error("Failed to update reflection:", error);
      alert(t('updateFailed') || 'Update failed');
    }
  };

  if (!reading) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden overflow-y-auto">
      <main className="flex-1 px-6 overflow-y-auto pb-40 no-scrollbar">
        <div className="flex flex-col items-center gap-6 py-4">
          {/* 日期显示 */}
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">{reading.date}</span>
          </div>

          {/* 卡牌展示区域：按照选择的牌阵布局排列 */}
          {/* 外层控制实际占用高度，内层视觉缩放；每张牌先居中再由 framer-motion x/y 偏移 */}
          <div className="self-stretch relative" style={{ height: 'calc(380px * 0.6)', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[380px] scale-[0.6] sm:scale-[0.75]">
              {reading.cards.map((card, idx) => {
                const layoutKey = String(reading.layoutType ?? reading.cards.length ?? '3');
                const pos = SPREAD_LAYOUTS[layoutKey]?.[idx] || { x: 0, y: 0 };
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                    animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
                    transition={{ delay: idx * 0.1, type: "spring", damping: 20 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[120px] glass-morphism rounded-xl flex flex-col items-center justify-between py-4 card-inner-glow shadow-2xl border border-slate-200 dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-xl"></div>
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

          {/* 用户问题展示 */}
          {reading.question && (
            <div className="w-full space-y-3">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-bold px-1">{t('whatIsOnYourMind')}</h3>
              <div className="glass-morphism p-6 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-slate-900/40 selectable-text">
                <p className="italic font-serif text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                  "{reading.question}"
                </p>
              </div>
            </div>
          )}

          {/* AI 解读内容 */}
          <div className="w-full space-y-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-bold px-1">{t('aiInterpretation')}</h3>
            <div className="glass-morphism p-6 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-slate-900/40 selectable-text">
              <p className="italic font-serif text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                "{reading.interpretation}"
              </p>
            </div>
          </div>

          {/* 用户感悟编辑区域 */}
          <div className="w-full space-y-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-bold px-1">{t('yourReflection')}</h3>
            <div className="relative">
              <textarea 
                className="w-full h-32 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-800 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-sm resize-none" 
                placeholder={t('reflectionPlaceholder')}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 底部固定操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-white via-white/80 to-transparent dark:from-background-dark dark:via-background-dark/80 dark:to-transparent z-50">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleSave}
            className="w-full py-4 glass-morphism rounded-2xl border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all bg-indigo-50 dark:bg-indigo-600/10 shadow-[0_4px_12px_rgba(99,102,241,0.1)] dark:shadow-[0_0_20px_rgba(99,102,241,0.15)] group"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-200 group-active:text-indigo-900 dark:group-active:text-white">{t('saveUpdates')}</span>
            <CheckCircle size={18} className="text-indigo-600 dark:text-indigo-300" />
          </button>
          <button 
            onClick={() => navigate('/journal')}
            className="w-full py-4 glass-morphism rounded-2xl border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('cancel')}</span>
          </button>
        </div>
        <div className="h-1 w-32 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mt-6" />
      </div>
    </div>
  );
};