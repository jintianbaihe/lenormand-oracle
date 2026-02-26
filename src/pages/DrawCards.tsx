import React, { useState, useEffect } from 'react';
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

export const DrawCards = () => {
  const { count, type } = useParams();
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  
  const cardCount = parseInt(count || '1');
  const spreadType = type || '3';
  
  const [ritualStage, setRitualStage] = useState<RitualStage>(RitualStage.SHUFFLE);
  const [drawnCards, setDrawnCards] = useState<Card[]>([]);
  const [shuffledDeck, setShuffledDeck] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isInterpreting, setIsInterpreting] = useState(false);
  
  // Spreading interaction
  const dragX = useMotionValue(0);
  const spreadProgress = useTransform(dragX, [0, 300], [0, 1]);
  const [isSpreadComplete, setIsSpreadComplete] = useState(false);
  
  // Selection state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

  const handleDraw = (card: Card) => {
    if (drawnCards.length >= cardCount) return;
    if (drawnCards.find(c => c.id === card.id)) return;

    const newDrawn = [...drawnCards, card];
    setDrawnCards(newDrawn);
    setSelectedIndex(null);
  };

  const handleFlip = (index: number) => {
    if (drawnCards.length < cardCount) return;
    if (flippedIndices.includes(index)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === cardCount) {
      handleComplete(newFlipped);
    }
  };

  const handleComplete = async (finalFlipped: number[]) => {
    setIsInterpreting(true);
    try {
      // Fetch interpretation before navigating to ensure stability
      const result = await interpretReading(drawnCards, language);
      
      // Small delay for ritual feel
      setTimeout(() => {
        navigate('/result', { state: { cards: drawnCards, interpretation: result } });
      }, 800);
    } catch (error) {
      console.error("Failed to fetch interpretation:", error);
      navigate('/result', { state: { cards: drawnCards } });
    } finally {
      setIsInterpreting(false);
    }
  };

  const layout = SPREAD_LAYOUTS[spreadType] || SPREAD_LAYOUTS['3'];

  // Calculate card positions in the spread
  const getSpreadCardStyle = (index: number, total: number, progress: number) => {
    const baseAngle = -45 + (index / (total - 1)) * 90;
    const angle = baseAngle * progress;
    const x = (index - (total - 1) / 2) * 20 * progress;
    const y = Math.abs(index - (total - 1) / 2) * 5 * progress;
    
    return {
      rotate: angle,
      x: x,
      y: y,
      zIndex: 10 + index
    };
  };

  return (
    <div className="flex-1 flex flex-col bg-midnight relative overflow-hidden select-none touch-none">
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

      <main className="flex-1 flex flex-col relative z-10 ritual-container">
        {/* Loading Overlay for AI Interpretation */}
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

        {/* Drawn Cards Layout (Face Down) - Positioned higher to avoid overlap */}
        <div className="absolute top-[2%] left-0 right-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="relative w-full h-[200px] flex items-center justify-center">
            {layout.slice(0, cardCount).map((pos, i) => (
              <motion.div 
                key={i}
                layoutId={drawnCards[i]?.id}
                initial={{ opacity: 0, scale: 0.5, x: 0, y: 400 }}
                animate={drawnCards[i] ? { opacity: 1, scale: 1, x: pos.x, y: pos.y } : { opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                onClick={() => handleFlip(i)}
                className={cn(
                  "absolute w-[70px] h-[110px] rounded-lg border flex items-center justify-center transition-all duration-500 pointer-events-auto",
                  "glass-morphism border-gold/20 bg-slate-900/90",
                  drawnCards.length === cardCount && !flippedIndices.includes(i) ? "cursor-pointer ring-1 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : ""
                )}
              >
                <AnimatePresence mode="wait">
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
                    {flippedIndices.includes(i) && drawnCards[i] ? (
                      <>
                        <div className="text-indigo-600 dark:text-indigo-300 mb-1">
                          {React.createElement(IconMap[drawnCards[i].icon] || Sparkles, { size: 24, strokeWidth: 1.5 })}
                        </div>
                        <span className="text-[8px] uppercase tracking-widest font-bold text-center text-indigo-900/60 dark:text-indigo-200/60">
                          {language === 'cn' ? drawnCards[i].nameCn : drawnCards[i].name}
                        </span>
                      </>
                    ) : (
                      <div className="w-full h-full border border-slate-300/20 dark:border-white/5 rounded-sm flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full border border-slate-400/20 dark:border-gold/20 opacity-20" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Spreading Ritual - Positioned lower */}
        <div className="flex-1 flex flex-col mt-auto pb-20 relative">
          <motion.div 
            animate={{ y: isSpreadComplete ? 60 : 0 }}
            className="relative w-full h-64 flex items-center justify-center overflow-visible mb-12"
          >
            {/* The Deck / Spread */}
            <div className="relative w-full h-full flex items-center justify-center">
              {shuffledDeck.slice(0, 20).map((card, i) => {
                const isDrawn = drawnCards.some(c => c.id === card.id);
                const isSelected = selectedIndex === i;
                
                return (
                  <motion.div
                    key={`${card.id}-${shuffleKey}`}
                    layoutId={card.id}
                    className={cn(
                      "absolute w-[70px] h-[110px] rounded-md border shadow-2xl transition-all duration-300",
                      "glass-morphism border-gold/20 bg-slate-900/90",
                      isSelected && "border-gold/80 shadow-[0_-15px_25px_rgba(212,175,55,0.3),0_0_10px_rgba(212,175,55,0.2)]",
                      isDrawn && "opacity-0 pointer-events-none"
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
                        handleShuffleClick();
                      } else if (isSpreadComplete) {
                        handleDraw(card);
                      }
                    }}
                    onMouseEnter={() => isSpreadComplete && setSelectedIndex(i)}
                    onMouseLeave={() => setSelectedIndex(null)}
                  >
                    <div className="w-full h-full border border-white/5 rounded-sm flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                      <div className="w-4 h-4 rounded-full border border-gold/20 opacity-20 flex items-center justify-center">
                        <span className="text-[8px] text-gold/40">✧</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

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
          </motion.div>

          {/* Guidance Text & Progress Bar - Below the deck */}
          <div className="flex flex-col items-center gap-6 px-10 relative z-20">
            <div className="text-center">
              <p className="text-[11px] font-medium tracking-[0.3em] text-indigo-300/40 uppercase mb-2">{t('tactileRitual')}</p>
              <p className="font-serif italic text-lg text-indigo-100/70">
                {ritualStage === RitualStage.SHUFFLE ? (shuffleCount < 3 ? t('tapToShuffle') : t('swipeToDraw')) : 
                 !isSpreadComplete ? t('swipeToSpread') : 
                 drawnCards.length < cardCount ? t('selectMoreCards', { count: cardCount - drawnCards.length }) :
                 t('tapToFlip')}
              </p>
            </div>

            {/* Progress Bar / Hint */}
            <div className="flex flex-col items-center gap-2">
              {!isSpreadComplete ? (
                <>
                  <div className="w-32 h-1 bg-white/10 rounded-full relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-gold/40 rounded-full"
                      style={{ scaleX: spreadProgress, originX: 0 }}
                    />
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-medium opacity-40">{t('dragAcrossHorizon')}</span>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 w-64">
                  <div className="flex justify-between w-full px-2">
                    <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-bold">{t('cardsDrawn')}</span>
                    <span className="text-[10px] text-gold tracking-[0.2em] font-bold">{drawnCards.length} / {cardCount}</span>
                  </div>
                  <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gold/60 shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(drawnCards.length / cardCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-12 pt-6 px-10 relative z-50 flex flex-col items-center gap-6">
        <div className="h-1 w-32 bg-white/10 rounded-full"></div>
      </footer>
    </div>
  );
};
