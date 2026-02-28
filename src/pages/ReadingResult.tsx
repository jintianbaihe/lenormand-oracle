import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Share2, Brain, Star, Sparkles, Zap, Heart, CircleDot, Mail, User, Moon, Key, Anchor, Plus, LucideIcon, Clover, Ship, Home, TreeDeciduous, Cloud, Snail, Skull, Flower, Sword, Flame, Bird, Baby, Ghost, Shield, Wind, Building, Palmtree, Mountain, Split, Bug, Book, Fish, Flower2 } from 'lucide-react';
import { interpretReading } from '../services/geminiService';
import { apiService } from '../services/apiService';
import { Card, Reading } from '../types';
import { SPREAD_LAYOUTS } from '../constants';
import { cn } from '../utils';
import { useAppContext } from '../context/AppContext';

const IconMap: Record<string, LucideIcon> = {
  Heart, Sparkles, Zap, CircleDot, Mail, User, Moon, Key, Anchor, Plus, Star,
  Clover, Ship, Home, TreeDeciduous, Cloud, Snail, Skull, Flower, Sword, Flame,
  Bird, Baby, Ghost, Shield, Wind, Building, Palmtree, Mountain, Split, Bug,
  Book, Fish, Flower2
};

/**
 * 占卜结果页面组件
 * 负责展示 AI 对抽取的卡牌组合的解读结果，并提供保存和分享功能
 */
export const ReadingResult = () => {
  // 获取当前路由位置信息，用于接收传递过来的卡牌数据
  const location = useLocation();
  // 获取路由导航钩子
  const navigate = useNavigate();
  // 从全局上下文获取翻译函数和当前语言
  const { t, language } = useAppContext();
  
  // 从路由状态中获取抽取的卡牌数组和牌阵类型
  const cards = location.state?.cards as Card[];
  const layoutType = location.state?.layoutType as string || '3';
  
  // 状态管理：
  // interpretation: 存储 AI 返回的解读 JSON
  // loading: 是否正在等待 AI 响应
  // isSaved: 当前记录是否已保存到本地
  // showSaveModal: 是否显示填写感悟的弹窗
  // reflection: 用户填写的感悟文本
  const [interpretation, setInterpretation] = useState<any>(location.state?.interpretation || null);
  const [loading, setLoading] = useState(!location.state?.interpretation);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [reflection, setReflection] = useState('');
 
  // 页面加载时自动获取 AI 解读
  useEffect(() => {
    // 安全检查：如果没有卡牌数据，直接返回主页
    if (!cards || cards.length === 0) {
      navigate('/');
      return;
    }

    // 定义异步获取解读的方法
    const getInterpretation = async () => {
      if (interpretation) {
        setLoading(false);
        return;
      }
      
      try {
        // 调用 Gemini AI 服务进行解读
        const result = await interpretReading(cards, language);
        
        // 数据清洗：确保结果包含预期属性，如果 API 异常则使用回退方案
        const safeResult = {
          title: result?.title || (language === 'cn' ? "静默之路" : "The Silent Path"),
          summary: result?.summary || (language === 'cn' ? "今天的牌面笼罩在神秘之中。" : "The cards remain veiled in mystery today."),
          detailedAnalysis: result?.detailedAnalysis || (language === 'cn' ? "有时宇宙要求的是耐心而非答案。" : "Sometimes the universe asks for patience rather than answers."),
          guidance: result?.guidance || (language === 'cn' ? "相信你生命中看不见的暗流。" : "Trust the unseen currents of your life.")
        };

        setInterpretation(safeResult);
      } catch (error) {
        // 错误处理：记录日志并显示默认解读
        console.error("Failed to get interpretation:", error);
        setInterpretation({
          title: language === 'cn' ? "静默之路" : "The Silent Path",
          summary: language === 'cn' ? "今天的牌面笼罩在神秘之中。" : "The cards remain veiled in mystery today.",
          detailedAnalysis: language === 'cn' ? "有时宇宙要求的是耐心而非答案。" : "Sometimes the universe asks for patience rather than answers.",
          guidance: language === 'cn' ? "相信你生命中看不见的暗流。" : "Trust the unseen currents of your life."
        });
      } finally {
        // 无论成功失败，都关闭加载状态
        setLoading(false);
      }
    };

    getInterpretation();
  }, [cards, navigate, language]);

  /**
   * 处理保存按钮点击
   * 如果未保存，则打开感悟填写弹窗
   */
  const handleSave = () => {
    if (isSaved) {
      setIsSaved(false); // 逻辑重置（可选）
      return;
    }
    setShowSaveModal(true); // 显示填写感悟的弹窗
  };

  /**
   * 确认保存到后端数据库
   */
  const confirmSave = async () => {
    if (!interpretation) return;

    try {
      // 构建完整的占卜记录对象
      const readingData: Omit<Reading, 'id'> = {
        date: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', { month: 'long', day: 'numeric', year: 'numeric' }),
        cards,
        interpretation: interpretation.summary,
        title: interpretation.title,
        spreadType: cards.length,
        layoutType,
        reflection: reflection.trim() || undefined // 存储用户感悟
      };
      
      // 调用 API 服务保存到后端
      await apiService.saveReading(readingData);
      
      // 更新 UI 状态
      setIsSaved(true);
      setShowSaveModal(false);
    } catch (error) {
      console.error("Failed to save reading:", error);
      alert(language === 'cn' ? "保存失败，请稍后重试" : "Failed to save, please try again later");
    }
  };

  /**
   * 处理分享功能
   * 优先调用系统原生分享，不支持则回退到剪贴板
   */
  const handleShare = async () => {
    if (!interpretation) return;
    
    const shareText = `${interpretation.title}\n\n${interpretation.summary}\n\n${interpretation.guidance}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: interpretation.title,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // 回退方案：复制到剪贴板
      try {
        await navigator.clipboard.writeText(shareText);
        alert(language === 'cn' ? "解读已复制到剪贴板" : "Interpretation copied to clipboard");
      } catch (err) {
        console.error("Clipboard failed:", err);
      }
    }
  };

  // 标题处理：将标题按空格拆分，最后一个单词设为斜体，增加设计感
  const titleWords = interpretation?.title?.split(' ') || [];

  return (
    <main className="flex-1 flex flex-col px-6 pt-4 pb-32 w-full max-w-2xl mx-auto overflow-y-auto no-scrollbar">
      {/* 卡牌展示区域：按照选择的牌阵布局排列 */}
      {/* 外层容器按缩放比例设置实际高度，避免与下方内容重叠 */}
      <div className="relative w-full overflow-visible shrink-0 mt-4 mb-6" style={{ height: 'calc(380px * 0.6)' }}>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[380px] flex items-center justify-center scale-[0.6] sm:scale-[0.75]">
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

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="mb-8"
          >
            <Sparkles size={48} className="text-primary opacity-50" />
          </motion.div>
          <p className="text-indigo-300/60 text-xs uppercase tracking-[0.3em] font-bold animate-pulse">{t('consultingOracle')}</p>
        </div>
      ) : (
        <>
          {/* 解读内容区域：展示 AI 生成的详细分析 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-morphism rounded-3xl p-8 mb-8 flex-1 relative dark:bg-slate-900/60 selectable-text"
          >
        {/* 顶部装饰图标 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 glass-morphism rounded-full flex items-center justify-center border-indigo-500/20">
          <Brain size={20} className="text-indigo-300" />
        </div>
        
        {/* 解读标题 */}
        <h2 className="font-serif text-3xl text-center mb-6 mt-2 text-slate-900 dark:text-white">
          {titleWords.map((word: string, i: number) => 
            i === titleWords.length - 1 ? <i key={i} className="italic">{word}</i> : word + ' '
          )}
        </h2>

        {/* 详细文本：总结和分析 */}
        <div className="space-y-6 text-slate-600 dark:text-slate-300/90 leading-relaxed font-light text-sm">
          <p>{interpretation.summary}</p>
          <p>{interpretation.detailedAnalysis}</p>
          
          {/* 底部指引：引用样式 */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-300/50 mb-2 font-bold">{t('guidance')}</p>
            <p className="italic font-serif text-lg text-slate-800 dark:text-slate-200">"{interpretation.guidance}"</p>
          </div>
        </div>
      </motion.div>

      {/* 操作按钮区域：保存和分享 */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleSave}
          disabled={isSaved}
          className={cn(
            "w-full py-4 glass-morphism rounded-full flex items-center justify-center gap-2 border-indigo-200 dark:border-indigo-500/20 active:scale-95 transition-all",
            isSaved ? "bg-indigo-500/20 opacity-80" : "hover:bg-slate-100 dark:hover:bg-white/5"
          )}
        >
          <Bookmark size={18} className={cn("text-indigo-600 dark:text-indigo-300", isSaved && "fill-indigo-600 dark:fill-indigo-300")} />
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

  {/* 保存感悟的弹窗：使用 AnimatePresence 实现动画 */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* 背景遮罩：点击可关闭弹窗 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
              className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md"
            />
            {/* 弹窗主体：全屏布局，适配移动端 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full h-full max-w-md flex flex-col px-6 pt-[calc(3rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] overflow-y-auto no-scrollbar dark:bg-transparent"
            >
              {/* 顶部日期 */}
              <div className="text-center mb-8">
                <span className="text-[10px] font-bold tracking-[0.4em] text-indigo-600 dark:text-primary uppercase">
                  {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {/* 卡牌预览缩略图 */}
              <div className="relative w-full h-[180px] flex items-center justify-center scale-[0.6] mb-10">
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
              {/* AI 解读摘要预览 */}
              <div className="mb-8">
                <h4 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-400 uppercase mb-4">{t('aiInterpretation')}</h4>
                <div className="glass-morphism rounded-2xl p-6 border-slate-200 dark:border-white/10 dark:bg-slate-900/40">
                  <p className="italic font-serif text-lg text-slate-700 dark:text-slate-200 leading-relaxed">
                    "{interpretation.summary}"
                  </p>
                </div>
              </div>

              {/* 用户填写感悟区域：多行文本输入 */}
              <div className="flex-1 flex flex-col mb-8">
                <h4 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-400 uppercase mb-4">{t('yourReflection')}</h4>
                <textarea 
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder={t('reflectionPlaceholder')}
                  className="flex-1 w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-sm text-slate-800 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/30 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* 弹窗底部操作按钮：确认保存和取消 */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={confirmSave}
                  className="w-full py-4 bg-indigo-600 dark:bg-indigo-600/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white dark:text-indigo-200 border dark:border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.3)] dark:shadow-[0_0_20px_rgba(99,102,241,0.15)] active:scale-95 transition-all"
                >
                  {t('saveResult')}
                </button>
                <button 
                  onClick={() => setShowSaveModal(false)}
                  className="w-full py-4 glass-morphism rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400 border-slate-200 dark:border-white/10 active:scale-95 transition-all"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};