import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

/**
 * QuestionInput 组件：用户输入占卜问题的界面
 * 在选择牌阵之前，引导用户明确自己的问题
 */
export const QuestionInput = () => {
  const navigate = useNavigate();
  const { t, setQuestion, question: globalQuestion } = useAppContext();
  const [localQuestion, setLocalQuestion] = useState(globalQuestion);

  const handleSubmit = () => {
    setQuestion(localQuestion);
    navigate('/spread');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 pt-8 overflow-y-auto no-scrollbar">
      {/* 背景装饰光晕 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center space-y-8 relative z-10"
      >
        {/* 输入区域 */}
        <div className="w-full">
          <label className="block text-center mb-6">
            <span className="font-serif italic text-2xl text-slate-900 dark:text-white/80">
              {t('whatIsOnYourMind')}
            </span>
          </label>
          
          <div className="relative group">
            <textarea 
              value={localQuestion}
              onChange={(e) => setLocalQuestion(e.target.value)}
              className="w-full h-48 p-6 rounded-3xl glass-morphism text-lg font-serif text-slate-900 dark:text-slate-200 resize-none leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all bg-white/40 dark:bg-white/5"
              placeholder={t('questionPlaceholder')}
            ></textarea>
            
            {/* 装饰性边角 */}
            <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-indigo-400/20 rounded-tl"></div>
            <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-indigo-400/20 rounded-br"></div>
          </div>
        </div>

        {/* 提交按钮 */}
        <button 
          onClick={handleSubmit}
          className="w-full py-5 rounded-2xl glow-button transition-all group overflow-hidden relative bg-primary/10 border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="font-sans font-medium tracking-[0.2em] text-indigo-600 dark:text-indigo-100 uppercase text-sm">
            {t('submitQuestion')}
          </span>
        </button>

        {/* 建议区域 */}
        <div className="w-full px-4 pt-4 flex flex-col items-center">
          <div className="h-[1px] w-12 bg-indigo-500/20 mb-6"></div>
          
          <div className="relative w-full flex justify-center mb-8">
            {/* 装饰性卡牌背景 */}
            <div className="absolute inset-0 flex justify-center -space-x-4 opacity-10 pointer-events-none">
              <div className="w-12 h-20 rounded border border-indigo-500/40 bg-indigo-950/20 rotate-[-15deg]"></div>
              <div className="w-12 h-20 rounded border border-indigo-500/40 bg-indigo-950/20 rotate-[-5deg]"></div>
              <div className="w-12 h-20 rounded border border-indigo-500/40 bg-indigo-950/20 rotate-[5deg]"></div>
              <div className="w-12 h-20 rounded border border-indigo-500/40 bg-indigo-950/20 rotate-[15deg]"></div>
            </div>
            
            <div className="relative z-10 text-center flex flex-col items-center">
              <span className="block text-slate-500 dark:text-slate-300/60 mb-3 italic font-serif text-sm">
                {t('pieceOfGuidance')}
              </span>
              <p className="text-slate-600 dark:text-slate-400/80 text-sm leading-relaxed font-light max-w-[280px]">
                {t('guidanceText')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
