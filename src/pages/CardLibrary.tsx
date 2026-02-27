// 导入 React 核心钩子
import React, { useState, useMemo } from 'react';
// 导入动画库
import { motion, AnimatePresence } from 'motion/react';
// 导入图标库
import { Search, X, Sparkles, Zap, Clover, Ship, Home, TreeDeciduous, Cloud, Snail, Skull, Flower, Sword, Flame, Bird, Baby, Ghost, Shield, Wind, Building, Palmtree, Mountain, Split, Bug, Heart, CircleDot, Book, Mail, User, Moon, Key, Fish, Anchor, Plus, Flower2, Info, ArrowRight } from 'lucide-react';
// 导入卡牌数据和类型定义
import { LENORMAND_CARDS, Card } from '../types';
// 导入全局上下文
import { useAppContext } from '../context/AppContext';
// 导入工具函数
import { cn } from '../utils';

// 图标映射表
const IconMap: Record<string, any> = {
  Zap, Clover, Ship, Home, TreeDeciduous, Cloud, Snail, Skull, Flower, Sword, Flame, Bird, Baby, Ghost, Shield, Sparkles, Wind, Heart, Building, Palmtree, Mountain, Split, Bug, CircleDot, Book, Mail, User, Moon, Key, Fish, Anchor, Plus, Flower2
};

// 扑克牌花色映射 (传统雷诺曼关联)
const SuitMap: Record<number, string> = {
  1: "♥9", 2: "♦6", 3: "♠10", 4: "♥K", 5: "♥7", 6: "♣K", 7: "♣Q", 8: "♦9", 9: "♠Q", 10: "♦J",
  11: "♣J", 12: "♦7", 13: "♠J", 14: "♣9", 15: "♣10", 16: "♥6", 17: "♥Q", 18: "♥10", 19: "♠6", 20: "♠8",
  21: "♣8", 22: "♦Q", 23: "♣7", 24: "♥J", 25: "♣A", 26: "♦10", 27: "♠7", 28: "♥A", 29: "♠A", 30: "♠K",
  31: "♦A", 32: "♥8", 33: "♦8", 34: "♦K", 35: "♠9", 36: "♣6"
};

/**
 * 卡牌库页面组件
 * 允许用户浏览、搜索和过滤雷诺曼 36 张卡牌，并查看每张牌的详细含义
 */
export const CardLibrary = () => {
  // 从上下文获取翻译函数和当前语言
  const { t, language } = useAppContext();
  // 状态：搜索关键词
  const [searchQuery, setSearchQuery] = useState('');
  // 状态：当前选中的过滤器 (极性或花色)
  const [activeFilter, setActiveFilter] = useState<{ type: 'all' | 'polarity' | 'suit', value: string }>({ type: 'all', value: 'all' });
  // 状态：当前选中的卡牌（用于显示详情弹窗）
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // 定义所有分类常量
  const categories = ['positive', 'negative', 'neutral'] as const;
  const suits = ['hearts', 'diamonds', 'spades', 'clubs'] as const;

  // 使用 useMemo 缓存过滤后的卡牌列表，避免不必要的重新计算
  const filteredCards = useMemo(() => {
    return LENORMAND_CARDS.filter(card => {
      // 搜索逻辑：匹配名称（中英文）、关键词、核心含义、引申含义以及卡牌编号
      const matchesSearch = card.id.toString() === searchQuery || 
                            card.id.toString().padStart(2, '0') === searchQuery ||
                            card.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            card.nameCn.includes(searchQuery) ||
                            card.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            card.meanings[language].core.includes(searchQuery) ||
                            card.meanings[language].extended.includes(searchQuery);
      
      // 统一过滤逻辑
      let matchesFilter = true;
      if (activeFilter.type === 'polarity') {
        matchesFilter = card.polarity === activeFilter.value;
      } else if (activeFilter.type === 'suit') {
        matchesFilter = card.suit === activeFilter.value;
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  // 极性颜色映射
  const polarityColors = {
    positive: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    negative: "text-rose-400 border-rose-500/30 bg-rose-500/5",
    neutral: "text-slate-400 border-slate-500/30 bg-slate-500/5"
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0a0a0a] h-screen overflow-hidden">
      {/* 顶部：搜索框和分类过滤器 */}
      <div className="px-6 pt-2 pb-4 relative z-30">
        <div className="flex flex-col gap-5">

          {/* 搜索输入框 - 更加极简 */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input 
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-1 focus:ring-indigo-500/30 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none text-slate-900 dark:text-white transition-all shadow-sm dark:shadow-none" 
              placeholder={t('searchCards')}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 分类切换按钮组 - 极简风格，单行滚动 */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setActiveFilter({ type: 'all', value: 'all' })}
              className={cn(
                "whitespace-nowrap px-4 py-1.5 rounded-lg border text-[9px] font-bold tracking-[0.1em] uppercase transition-all",
                activeFilter.type === 'all' 
                  ? "bg-slate-200 dark:bg-white text-slate-900 dark:text-black border-slate-300 dark:border-white" 
                  : "bg-transparent text-slate-500 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30"
              )}
            >
              {t('all')}
            </button>
            
            {/* 极性过滤器 */}
            <div className="flex gap-2 border-l border-slate-200 dark:border-white/10 pl-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveFilter({ type: 'polarity', value: cat })}
                  className={cn(
                    "whitespace-nowrap px-4 py-1.5 rounded-lg border text-[9px] font-bold tracking-[0.1em] uppercase transition-all",
                    activeFilter.type === 'polarity' && activeFilter.value === cat 
                      ? "bg-slate-200 dark:bg-white text-slate-900 dark:text-black border-slate-300 dark:border-white" 
                      : "bg-transparent text-slate-500 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30"
                  )}
                >
                  {t(cat)}
                </button>
              ))}
            </div>

            {/* 花色过滤器 */}
            <div className="flex gap-2 border-l border-slate-200 dark:border-white/10 pl-2">
              {suits.map(suit => (
                <button 
                  key={suit}
                  onClick={() => setActiveFilter({ type: 'suit', value: suit })}
                  className={cn(
                    "whitespace-nowrap px-4 py-1.5 rounded-lg border text-[9px] font-bold tracking-[0.1em] uppercase transition-all",
                    activeFilter.type === 'suit' && activeFilter.value === suit 
                      ? "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500" 
                      : "bg-transparent text-slate-500 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30"
                  )}
                >
                  {t(suit)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 主体：卡牌网格列表 - 像素风格 */}
      <div className="px-6 pb-32">
        <div className="grid grid-cols-3 gap-4">
          {filteredCards.map((card, idx) => (
            <motion.button 
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.01 }}
              onClick={() => {
                setSelectedCard(card);
              }}
              className="relative group aspect-[3/4] bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-sm overflow-hidden flex flex-col items-center justify-center gap-3 active:scale-95 transition-all shadow-sm dark:shadow-none"
            >
              {/* 像素风格装饰背景 */}
              <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none text-slate-900 dark:text-white" 
                   style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', backgroundSize: '4px 4px' }} />
              
              {/* 顶部编号和花色 */}
              <div className="absolute top-2 left-2 right-2 flex justify-between items-center px-1">
                <span className="text-[8px] font-mono text-slate-400 dark:text-slate-600">{card.id.toString().padStart(2, '0')}</span>
                <span className="text-[8px] font-mono text-slate-400 dark:text-slate-600">{SuitMap[card.id]}</span>
              </div>

              {/* 卡牌图标 - 更加居中且突出 */}
              <div className="text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                {React.createElement(IconMap[card.icon] || Sparkles, { size: 36, strokeWidth: 1 })}
              </div>

              {/* 卡牌名称 - 极简 */}
              <div className="absolute bottom-2 left-0 right-0 text-center">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  {language === 'cn' ? card.nameCn : card.name}
                </span>
              </div>

              {/* 极性指示器 */}
              <div className={cn(
                "absolute top-0 right-0 w-1 h-1 rounded-bl-full",
                card.polarity === 'positive' ? "bg-emerald-500" : card.polarity === 'negative' ? "bg-rose-500" : "bg-slate-500"
              )} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* 详情弹窗：全屏沉浸式 */}
      <AnimatePresence>
        {selectedCard && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/90 dark:bg-black/90 backdrop-blur-md"
              onClick={() => setSelectedCard(null)}
            >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-[#0f0f0f] w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2rem] sm:rounded-[2rem] border-t sm:border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 顶部 Header */}
              <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{selectedCard.id.toString().padStart(2, '0')}</span>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{SuitMap[selectedCard.id]}</span>
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-widest font-bold",
                      polarityColors[selectedCard.polarity]
                    )}>
                      {t(selectedCard.polarity)}
                    </span>
                  </div>
                  <h2 className="text-4xl font-serif text-slate-900 dark:text-white mt-2 tracking-tight">
                    {language === 'cn' ? selectedCard.nameCn : selectedCard.name}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedCard(null)}
                  className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 overflow-y-auto px-8 pb-12 no-scrollbar">
                <div className="mt-6 space-y-8">
                  {/* 核心含义卡片 */}
                  <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden group shadow-sm dark:shadow-none">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] dark:opacity-10 group-hover:opacity-20 transition-opacity text-slate-900 dark:text-white">
                      {React.createElement(IconMap[selectedCard.icon] || Sparkles, { size: 80, strokeWidth: 1 })}
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Info size={14} className="text-indigo-500 dark:text-indigo-400" />
                      <h4 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-bold">{t('coreMeaning')}</h4>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 text-xl leading-relaxed font-serif italic relative z-10">
                      "{selectedCard.meanings[language].core}"
                    </p>
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 relative z-10">
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        {selectedCard.meanings[language].extended}
                      </p>
                    </div>
                  </div>

                  {/* 关键词标签 */}
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.keyword.split(',').map(kw => (
                      <span key={kw} className="px-3 py-1 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] uppercase tracking-widest font-bold rounded-md border border-indigo-500/10 dark:border-indigo-500/20">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>

                  {/* 象征含义网格 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: t('career'), icon: Building, value: selectedCard.meanings[language].career },
                      { label: t('love'), icon: Heart, value: selectedCard.meanings[language].love },
                      { label: t('health'), icon: Zap, value: selectedCard.meanings[language].health },
                      { label: t('person'), icon: User, value: selectedCard.meanings[language].person },
                    ].map((item, i) => (
                      <div key={i} className="p-5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 transition-colors shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-2 mb-3">
                          <item.icon size={14} className="text-indigo-500 dark:text-indigo-400" />
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">{item.label}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
