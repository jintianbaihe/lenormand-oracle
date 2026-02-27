import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Clover, Ship, Home, TreeDeciduous, Cloud, Snail, Skull, Flower, Sword, Flame, Bird, Baby, Ghost, Shield, Wind, Heart, Building, Palmtree, Mountain, Split, Bug, CircleDot, Book, Mail, User, Moon, Key, Fish, Anchor, Plus, Flower2, Star, LucideIcon, X, History } from 'lucide-react';
import { interpretReading } from '../services/geminiService';
import { LENORMAND_CARDS, Card } from '../types';
import { cn } from '../utils';
import { useAppContext } from '../context/AppContext';

// Ritual Stages
enum RitualStage {
  SHUFFLE = 'SHUFFLE',
  SPREAD = 'SPREAD',
  DRAW = 'DRAW',
  REVEAL = 'REVEAL'
}

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

// FlyingCard: captures origin at mount time, animates straight to target
interface FlyingCardProps {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  onClick: () => void;
  canFlip: boolean;
  children: React.ReactNode;
}
const FlyingCard: React.FC<FlyingCardProps> = ({ originX, originY, targetX, targetY, onClick, canFlip, children }) => {
  // Capture origin synchronously at mount - useRef so it never changes
  const initialPos = useRef({ x: originX, y: originY });
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "absolute w-[60px] h-[94px] rounded-lg border flex items-center justify-center pointer-events-auto",
        "glass-morphism border-gold/20 bg-slate-900/90",
        canFlip ? "cursor-pointer ring-1 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : ""
      )}
      initial={{ x: initialPos.current.x, y: initialPos.current.y, opacity: 1 }}
      animate={{ x: targetX, y: targetY, opacity: 1 }}
      transition={{ type: "spring", damping: 22, stiffness: 120 }}
    >
      {children}
    </motion.div>
  );
};

export const DrawCards = () => {
  const { count, type } = useParams();
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  
  const cardCount = parseInt(count || '1');
  const spreadType = type || '3';
  
  const [ritualStage, setRitualStage] = useState<RitualStage>(RitualStage.SHUFFLE);
  // Each drawn card carries its fly-origin (captured synchronously at click time)
  const [drawnCards, setDrawnCards] = useState<{ card: Card; fromX: number; fromY: number }[]>([]);
  const [shuffledDeck, setShuffledDeck] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isInterpreting, setIsInterpreting] = useState(false);
  
  // Spreading interaction
  const dragX = useMotionValue(0);
  const spreadProgress = useTransform(dragX, [0, 300], [0, 1]);
  const [isSpreadComplete, setIsSpreadComplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // 牌阵容器 ref：用于计算飞行终点的相对坐标系原点
  const layoutContainerRef = useRef<HTMLDivElement | null>(null);
  // 牌堆内层容器 ref：用于获取牌堆中心的屏幕坐标（这个 div 不参与动画，坐标稳定）
  const deckContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const deck = [...LENORMAND_CARDS].sort(() => Math.random() - 0.5);
    setShuffledDeck(deck);
  }, []);

  const handleShuffleClick = () => {
    if (ritualStage !== RitualStage.SHUFFLE) return;
    setShuffleKey(prev => prev + 1);
    setShuffleCount(prev => prev + 1);
    // Re-shuffle a bit
    setShuffledDeck(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleDraw = (card: Card, cardIndex: number) => {
    // 防止重复抽牌
    if (drawnCards.length >= cardCount) return;
    if (drawnCards.find(dc => dc.card.id === card.id)) return;

    // =====================================================================
    // 纯数学计算牌的屏幕坐标，完全不依赖 getBoundingClientRect 测量动画元素
    // 原因：motion.div 在动画过程中 getBoundingClientRect 返回的是动画中间态，不稳定
    //
    // 公式：
    //   牌的屏幕中心 = 牌堆容器中心 + getSpreadCardStyle 返回的 (x, y) 偏移
    //   fromX/fromY  = 牌的屏幕中心 - 牌阵容器中心
    // =====================================================================
    const deckEl = deckContainerRef.current;
    const layoutEl = layoutContainerRef.current;
    let fromX = 0;
    let fromY = 0;

    if (deckEl && layoutEl) {
      // 牌堆内层容器（静止 div，不参与动画）的中心屏幕坐标
      const deckRect = deckEl.getBoundingClientRect();
      const deckCX = deckRect.left + deckRect.width / 2;
      const deckCY = deckRect.top + deckRect.height / 2;

      // 用相同的数学公式计算该牌在扇形展开后的偏移量
      const cardOffset = getSpreadCardStyle(cardIndex, 20, 1); // progress=1 即完全展开状态

      // 牌的实际屏幕中心坐标
      const cardScreenCX = deckCX + (cardOffset.x as number);
      const cardScreenCY = deckCY + (cardOffset.y as number);

      // 牌阵容器中心屏幕坐标（飞行动画的坐标系原点）
      const layoutRect = layoutEl.getBoundingClientRect();
      const layoutCX = layoutRect.left + layoutRect.width / 2;
      const layoutCY = layoutRect.top + layoutRect.height / 2;

      // 相对于牌阵容器中心的起飞坐标
      fromX = cardScreenCX - layoutCX;
      fromY = cardScreenCY - layoutCY;
    }

    // 将坐标和卡牌数据打包为一个对象，同步写入 state
    // 保证 FlyingCard 挂载时 fromX/fromY 一定已就绪
    setDrawnCards(prev => [...prev, { card, fromX, fromY }]);
    setSelectedIndex(null);
  };

  const handleFlip = (index: number) => {
    // 未抽完所有牌时不允许翻牌
    if (drawnCards.length < cardCount) return;
    // 已翻过的牌不重复翻
    if (flippedIndices.includes(index)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    // 翻完所有牌后不自动跳转，等待用户点击"查看分析结果"按钮
  };

  // 用户主动点击"查看分析结果"按钮时触发，此时才开始加载 AI 解读
  const handleViewResult = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    setIsInterpreting(true);
    try {
      // Fetch interpretation before navigating to ensure stability
      const result = await interpretReading(drawnCards.map(dc => dc.card), language);
      
      // Small delay for ritual feel
      setTimeout(() => {
        navigate('/result', { state: { cards: drawnCards.map(dc => dc.card), interpretation: result } });
      }, 800);
    } catch (error) {
      console.error("Failed to fetch interpretation:", error);
      navigate('/result', { state: { cards: drawnCards.map(dc => dc.card) } });
    } finally {
      setIsInterpreting(false);
    }
  };

  const layout = SPREAD_LAYOUTS[spreadType] || SPREAD_LAYOUTS['3'];

  // Calculate card positions in the spread - downward arc
  const getSpreadCardStyle = (index: number, total: number, progress: number) => {
    const radius = 320;
    const totalAngle = 70;
    const startAngle = -totalAngle / 2;
    const baseAngle = startAngle + (index / (total - 1)) * totalAngle;
    const angleRad = (baseAngle * Math.PI) / 180;

    const x = radius * Math.sin(angleRad) * progress;
    const y = (radius - radius * Math.cos(angleRad)) * progress; // arc downward
    const rotate = baseAngle * progress;

    return {
      rotate,
      x,
      y,
      zIndex: 10 + index
    };
  };

  return (
    <div className="flex-1 flex flex-col bg-midnight relative select-none touch-none">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.08)_0%,transparent_60%)]"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 pt-14 pb-4">
        <button 
          onClick={() => navigate('/spread')}
          className="w-10 h-10 flex items-center justify-center glass-morphism rounded-full active:scale-90 transition-transform"
        >
          <X size={20} className="text-slate-400" />
        </button>
        <div className="text-center">
          <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold/60 mb-0.5">
            {ritualStage === RitualStage.SHUFFLE ? 'Step 02' : 'Step 03'}
          </h2>
          <p className="font-serif italic text-xl text-white">
            {ritualStage === RitualStage.SHUFFLE ? t('shuffle') : t('draw')}
          </p>
        </div>
        <button className="w-10 h-10 flex items-center justify-center glass-morphism rounded-full">
          <Sparkles size={20} className="text-slate-400" />
        </button>
      </header>

      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto no-scrollbar">
        {/* AI 解读加载遮罩 */}
        <AnimatePresence>
          {isInterpreting && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-midnight/60 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="mb-6"
              >
                <Sparkles size={40} className="text-gold opacity-80" />
              </motion.div>
              <p className="text-gold/60 text-[10px] uppercase tracking-[0.4em] font-bold animate-pulse">
                {t('consultingOracle')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 牌阵区域：使用相对高度以适应不同屏幕，增加顶部间距 */}
        <div className="flex-none flex items-center justify-center pt-12 min-h-[220px] h-[30vh] max-h-[300px]">
          <div ref={layoutContainerRef} className="relative w-full h-full flex items-center justify-center scale-[0.7] sm:scale-85 md:scale-100">
            {/* Empty slot placeholders */}
            {layout.slice(0, cardCount).map((pos, i) => (
              <div
                key={`slot-${i}`}
                className="absolute w-[60px] h-[94px] rounded-lg border border-white/10 bg-white/5"
                style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
              />
            ))}
            {/* Drawn cards - fly from captured deck position to layout slot */}
            <AnimatePresence>
              {drawnCards.map(({ card, fromX, fromY }, i) => {
                const pos = layout[i];
                return (
                  <FlyingCard
                    key={card.id}
                    originX={fromX}
                    originY={fromY}
                    targetX={pos.x}
                    targetY={pos.y}
                    onClick={() => handleFlip(i)}
                    canFlip={drawnCards.length === cardCount && !flippedIndices.includes(i)}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={flippedIndices.includes(i) ? 'front' : 'back'}
                        initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotateY: -180 }}
                        transition={{ duration: 0.4 }}
                        className={cn(
                          "w-full h-full rounded-lg border flex flex-col items-center justify-center p-2 shadow-xl transition-shadow duration-300",
                          flippedIndices.includes(i)
                            ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-slate-900 dark:border-indigo-500/30 shadow-indigo-500/10 dark:shadow-black/50"
                            : "bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-gold/30 shadow-inner"
                        )}
                      >
                        {flippedIndices.includes(i) ? (
                          <>
                            <div className="text-indigo-600 dark:text-indigo-300 mb-1">
                              {React.createElement(IconMap[card.icon] || Sparkles, { size: 24, strokeWidth: 1.5 })}
                            </div>
                            <span className="text-[8px] uppercase tracking-widest font-bold text-center text-indigo-900/60 dark:text-indigo-200/60">
                              {language === 'cn' ? card.nameCn : card.name}
                            </span>
                          </>
                        ) : (
                          <div className="w-full h-full border border-slate-300/20 dark:border-white/5 rounded-sm flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                            <div className="w-4 h-4 rounded-full border border-slate-400/20 dark:border-gold/20 opacity-20 flex items-center justify-center">
                              <span className="text-[8px] text-slate-400 dark:text-gold/40">✧</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </FlyingCard>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* 牌堆区域：flex-1 占据剩余空间 */}
        <div className="flex-1 flex items-center justify-center min-h-[120px] py-1">
          <div className="relative w-full h-36 flex items-center justify-center overflow-visible scale-[0.7] sm:scale-85 md:scale-100">
            {/* The Deck / Spread */}
            {/* deckContainerRef 挂在这个静止的 div 上，不参与任何 motion 动画，坐标稳定可靠 */}
            <div ref={deckContainerRef} className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence>
              {shuffledDeck.slice(0, 20).map((card, i) => {
                const isDrawn = drawnCards.some(dc => dc.card.id === card.id);
                const isHovered = selectedIndex === i;
                const isFlashing = selectedIndex === i && isSpreadComplete;
                if (isDrawn) return null;
                
                return (
                  <motion.div
                    key={`${card.id}-${shuffleKey}`}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                    className={cn(
                      "absolute w-[56px] h-[88px] rounded-md border shadow-2xl transition-[border-color,box-shadow] duration-200",
                      "bg-slate-200 dark:bg-slate-900",
                      isSpreadComplete && isHovered
                        ? "border-gold/80 shadow-[0_-15px_25px_rgba(212,175,55,0.3),0_0_10px_rgba(212,175,55,0.2)]"
                        : "border-slate-300 dark:border-gold/20 shadow-indigo-500/5 dark:shadow-black/40",
                    )}
                    style={{
                      transformOrigin: 'bottom center',
                      ...getSpreadCardStyle(i, 20, isSpreadComplete ? 1 : 0)
                    }}
                    animate={ritualStage === RitualStage.SHUFFLE ? {
                      x: [0, (i % 2 === 0 ? 40 : -40), 0],
                      y: [0, (i % 3 === 0 ? -10 : 10), 0],
                      rotate: [0, (i % 2 === 0 ? 15 : -15), 0],
                      scale: [1, 1.05, 1],
                      transition: { duration: 0.4, ease: "easeInOut" }
                    } : {}}
                    onClick={() => {
                      if (ritualStage === RitualStage.SHUFFLE) {
                        // 洗牌阶段：触发洗牌动画
                        handleShuffleClick();
                      } else if (isSpreadComplete) {
                        // 抽牌阶段：
                        // 1. 立即触发金光效果（视觉反馈）
                        // 2. 立即调用 handleDraw 传入当前牌的索引
                        //    必须在点击时立即执行，此时 DOM 位置最稳定
                        //    不能用 setTimeout 延迟，否则牌堆可能已经重渲染
                        setSelectedIndex(i);
                        handleDraw(card, i);
                      }
                    }}
                    onMouseEnter={() => isSpreadComplete && drawnCards.length < cardCount && setSelectedIndex(i)}
                    onMouseLeave={() => setSelectedIndex(null)}
                    onTouchStart={() => isSpreadComplete && drawnCards.length < cardCount && setSelectedIndex(i)}
                  >
                    <div className="w-full h-full border border-slate-300/10 dark:border-white/5 rounded-sm flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                      <div className="w-4 h-4 rounded-full border border-slate-400/20 dark:border-gold/20 opacity-20 flex items-center justify-center">
                        <span className="text-[8px] text-slate-400 dark:text-gold/40">✧</span>
                      </div>
                      {/* Gold burst on click */}
                      <AnimatePresence>
                        {isFlashing && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.6 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="absolute inset-0 rounded-md pointer-events-none"
                            style={{
                              background: 'radial-gradient(circle at center, rgba(212,175,55,0.85) 0%, rgba(212,175,55,0.4) 45%, transparent 75%)',
                              boxShadow: '0 0 24px 8px rgba(212,175,55,0.5), inset 0 0 16px rgba(212,175,55,0.3)',
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>

              {/* Drag Handle for Spreading & Shuffling */}
              {ritualStage === RitualStage.SHUFFLE && (
                <motion.div
                  drag
                  dragConstraints={{ left: 0, right: 300, top: -100, bottom: 100 }}
                  style={{ x: dragX }}
                  onTap={handleShuffleClick}
                  onDragEnd={(_, info) => {
                    // Check for vertical swipe (shuffle)
                    if (Math.abs(info.offset.y) > 50 && Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
                      handleShuffleClick();
                    } 
                    // Check for horizontal swipe (spread)
                    else if (info.offset.x > 150) {
                      setIsSpreadComplete(true);
                      setRitualStage(RitualStage.DRAW);
                    } else {
                      setRitualStage(RitualStage.SHUFFLE);
                    }
                  }}
                  className="absolute inset-0 z-[100] cursor-grab active:cursor-grabbing"
                />
              )}
            </div>
          </div>
        </div>

        {/* 引导词区域：固定在底部，确保在 Navbar 上方 */}
        <div className="flex-none flex flex-col items-center justify-center pb-2 h-[70px]">
            <AnimatePresence mode="wait">
              {flippedIndices.length === cardCount && drawnCards.length === cardCount ? (
                <motion.button
                  key="view-result-btn"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  onClick={handleViewResult}
                  className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full border border-gold/40 bg-gold/10 text-gold font-serif italic text-base sm:text-lg tracking-wide shadow-[0_0_20px_rgba(212,175,55,0.15)] active:scale-95 transition-transform hover:bg-gold/20 hover:border-gold/70"
                >
                  {language === 'cn' ? '查看分析结果' : 'View Reading'}
                </motion.button>
              ) : (
                <motion.div
                  key="guidance-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <p className="font-serif italic text-lg text-indigo-100/70">
                    {ritualStage === RitualStage.SHUFFLE
                      ? (shuffleCount < 3 ? t('tapToShuffle') : t('swipeToDraw'))
                      : !isSpreadComplete
                        ? t('swipeToSpread')
                        : drawnCards.length < cardCount
                          ? t('selectMoreCards', { count: cardCount - drawnCards.length })
                          : t('tapToFlip')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
      </main>
    </div>
  );
};
