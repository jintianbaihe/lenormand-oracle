import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Clover, Ship, Home, TreeDeciduous, Cloud, Snail, Skull, Flower, Sword, Flame, Bird, Baby, Ghost, Shield, Wind, Heart, Building, Palmtree, Mountain, Split, Bug, CircleDot, Book, Mail, User, Moon, Key, Fish, Anchor, Plus, Flower2, Star, LucideIcon } from 'lucide-react';
import { LENORMAND_CARDS, Card } from '../types';
import { cn } from '../utils';
import { useAppContext } from '../context/AppContext';

// Layout configurations for different spread types
const SPREAD_LAYOUTS: Record<string, { x: number, y: number }[]> = {
  '3': [
    { x: -100, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 }
  ],
  '5': [
    { x: 0, y: -120 }, { x: -100, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 120 }
  ],
  '7': [
    { x: -150, y: 60 }, { x: -100, y: -40 }, { x: -50, y: -100 }, { x: 0, y: -120 }, { x: 50, y: -100 }, { x: 100, y: -40 }, { x: 150, y: 60 }
  ],
  '9': [
    { x: -100, y: -120 }, { x: 0, y: -120 }, { x: 100, y: -120 },
    { x: -100, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 },
    { x: -100, y: 120 }, { x: 0, y: 120 }, { x: 100, y: 120 }
  ],
  'H': [
    { x: -100, y: -120 }, { x: 100, y: -120 },
    { x: -100, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 },
    { x: -100, y: 120 }, { x: 100, y: 120 }
  ],
  'GC': [
    { x: 0, y: -120 }, { x: -100, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 120 }
  ]
};

const IconMap: Record<string, LucideIcon> = {
  Heart, Sparkles, Zap, CircleDot, Mail, User, Moon, Key, Anchor, Plus, Star,
  Clover, Ship, Home, TreeDeciduous, Cloud, Snail, Skull, Flower, Sword, Flame,
  Bird, Baby, Ghost, Shield, Wind, Building, Palmtree, Mountain, Split, Bug,
  Book, Fish, Flower2
};

/**
 * 抽牌页面组件
 * 负责处理用户抽牌逻辑、牌阵布局显示以及翻牌交互
 */
export const DrawCards = () => {
  const { count, type } = useParams();
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  
  // 从 URL 参数获取抽牌数量和牌阵类型
  const cardCount = parseInt(count || '1');
  const spreadType = type || '3';
  
  // 状态管理：已抽取的牌、洗好的牌堆、已翻开的牌索引
  const [drawnCards, setDrawnCards] = useState<Card[]>([]);
  const [shuffledDeck, setShuffledDeck] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

  // 初始化：洗牌
  useEffect(() => {
    const deck = [...LENORMAND_CARDS].sort(() => Math.random() - 0.5);
    setShuffledDeck(deck);
  }, []);

  /**
   * 处理抽牌动作
   * @param card 被点击抽取的卡牌
   */
  const handleDraw = (card: Card) => {
    if (drawnCards.length >= cardCount) return; // 达到上限
    if (drawnCards.find(c => c.id === card.id)) return; // 防止重复抽取

    const newDrawn = [...drawnCards, card];
    setDrawnCards(newDrawn);
  };

  /**
   * 处理翻牌动作
   * @param index 牌阵中的位置索引
   */
  const handleFlip = (index: number) => {
    if (drawnCards.length < cardCount) return; // 还没抽完不能翻牌
    if (flippedIndices.includes(index)) return; // 已经翻过了

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // 如果所有牌都翻开了，延迟 1.5 秒跳转到结果页
    if (newFlipped.length === cardCount) {
      setTimeout(() => {
        navigate('/result', { state: { cards: drawnCards } });
      }, 1500);
    }
  };

  // 获取当前牌阵的布局坐标
  const layout = SPREAD_LAYOUTS[spreadType] || SPREAD_LAYOUTS['3'];

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden select-none touch-none">
      {/* 牌阵展示区域 */}
      <div className="relative w-full h-[400px] flex items-center justify-center z-10 mb-40 -translate-y-12">
        {layout.slice(0, cardCount).map((pos, i) => (
          <div 
            key={i}
            onClick={() => handleFlip(i)}
            className={cn(
              "absolute w-[70px] h-[110px] rounded-lg border flex items-center justify-center transition-all duration-500",
              "glass-morphism border-slate-200 dark:border-white/5",
              // 抽完牌但未翻开时显示提示效果
              drawnCards.length === cardCount && !flippedIndices.includes(i) ? "cursor-pointer ring-1 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : ""
            )}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`
            }}
          >
            <AnimatePresence mode="wait">
              {drawnCards[i] ? (
                // 已抽取的牌，支持正反面切换动画
                <motion.div
                  key={flippedIndices.includes(i) ? 'front' : 'back'}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: -180 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "w-full h-full rounded-lg border flex flex-col items-center justify-center p-2 shadow-lg",
                    flippedIndices.includes(i) 
                      ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-slate-900 dark:border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                      : "glass-morphism border-slate-200 dark:bg-none dark:bg-slate-900/80 dark:border-gold/20"
                  )}
                >
                  {flippedIndices.includes(i) ? (
                    // 牌面（正面）
                    <>
                      <div className="text-indigo-600 dark:text-indigo-300 mb-1">
                        {React.createElement(IconMap[drawnCards[i].icon] || Sparkles, { size: 20, strokeWidth: 1.5 })}
                      </div>
                      <span className="text-[7px] uppercase tracking-widest font-bold text-center text-indigo-900/60 dark:text-indigo-200/60">
                        {language === 'cn' ? drawnCards[i].nameCn : drawnCards[i].name}
                      </span>
                    </>
                  ) : (
                    // 牌背
                    <div className="w-full h-full border border-slate-300/20 dark:border-white/5 rounded-sm flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full border border-slate-400/20 dark:border-gold/20 opacity-20" />
                    </div>
                  )}
                </motion.div>
              ) : (
                // 未抽取的占位符
                <div className="text-[8px] uppercase tracking-widest text-slate-300 dark:text-white/10 font-bold">{i + 1}</div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* 引导文字 */}
      <div className="text-center px-8 z-20 mb-10">
        <p className="text-sm font-light text-slate-400 max-w-[240px] leading-relaxed">
          {drawnCards.length === 0 
            ? t('drawInstruction')
            : drawnCards.length < cardCount 
              ? t('drawnCount', { count: drawnCards.length, total: cardCount })
              : flippedIndices.length < cardCount 
                ? t('tapToFlip')
                : t('allCardsFlipped')}
        </p>
      </div>

      {/* 底部扇形牌堆 */}
      <div className="absolute bottom-[-120px] left-0 right-0 h-[300px] pointer-events-none" style={{ perspective: '1200px' }}>
        {Array.from({ length: 15 }).map((_, i) => {
          const angle = -60 + (i * 8.5);
          const isDrawn = shuffledDeck[i] && drawnCards.some(c => c.id === shuffledDeck[i].id);
          
          return (
            <motion.div
              key={i}
              className={cn(
                "absolute bottom-0 left-1/2 w-[60px] h-[100px] rounded-md border shadow-xl cursor-pointer pointer-events-auto transition-opacity duration-500",
                "glass-morphism border-slate-200 dark:bg-slate-900/90 dark:border-gold/20",
                isDrawn ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
              style={{
                transformOrigin: 'bottom center',
                x: '-50%',
                rotate: angle,
                y: -120
              }}
              whileHover={{ y: -140, scale: 1.05, transition: { duration: 0.2 } }}
              onClick={() => handleDraw(shuffledDeck[i])}
            />
          );
        })}
      </div>

      {/* 进度指示器 */}
      <footer className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                i < drawnCards.length ? "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-white/10"
              )} 
            />
          ))}
        </div>
        {drawnCards.length < cardCount && (
          <div className="glass-morphism px-6 py-2 rounded-xl">
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              {t('drawNext', { next: Math.min(drawnCards.length + 1, cardCount), total: cardCount })}
            </span>
          </div>
        )}
      </footer>
    </div>
  );
};
