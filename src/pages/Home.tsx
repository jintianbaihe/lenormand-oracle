import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

/**
 * 首页组件
 * 占卜应用的入口，负责展示欢迎语、品牌调性并引导用户开始占卜
 */
export const Home = () => {
  // 获取路由导航钩子
  const navigate = useNavigate();
  // 从全局上下文获取翻译函数
  const { t } = useAppContext();

  return (
    // 容器：弹性布局，居中对齐，设置内边距和相对定位
    <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
      {/* 欢迎语区域：包含副标题、主标题、装饰线和描述语 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} // 初始状态：透明且向下偏移
        animate={{ opacity: 1, y: 0 }}   // 动画目标：完全显示且回到原位
        className="text-center mb-16 relative z-10"
      >
        {/* 副标题：展示品牌定位 */}
        <p className="text-primary/70 font-medium mb-3 tracking-[0.2em] uppercase text-[10px]">{t('yourDailyPath')}</p>
        {/* 主标题：使用衬线字体 (font-serif) 营造神秘感 */}
        <h1 className="font-serif text-5xl md:text-6xl font-light leading-tight tracking-tight text-white mb-6">
          {t('howIsYourDay')} <br/><i className="font-serif italic">{t('today')}</i>
        </h1>
        {/* 装饰性短横线 */}
        <div className="h-[1px] w-12 bg-primary/20 mx-auto mb-6"></div>
        {/* 描述语：引导用户静心 */}
        <p className="text-slate-400 font-light max-w-[280px] mx-auto leading-relaxed text-sm">
          {t('quietMind')}
        </p>
      </motion.div>

      {/* 开始占卜按钮区域 */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} // 初始状态：略微缩小且透明
        animate={{ scale: 1, opacity: 1 }}   // 动画目标：正常大小且显示
        transition={{ delay: 0.2 }}          // 延迟 0.2 秒触发
        className="relative z-10 group"
      >
        {/* 按钮背景发光效果：使用 blur-3xl 营造柔和的光晕 */}
        <div className="absolute -inset-6 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-3xl bg-primary"></div>
        {/* 按钮外边框装饰 */}
        <div className="absolute -inset-0.5 rounded-full divination-btn-outer opacity-50"></div>
        {/* 核心交互按钮：圆形设计，毛玻璃质感 */}
        <button 
          onClick={() => navigate('/spread')} // 点击跳转到牌阵选择页面
          className="relative flex flex-col items-center justify-center gap-6 glass-morphism text-white w-52 h-52 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 group overflow-hidden border-white/20"
        >
          {/* 内部渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none"></div>
          {/* 图标区域 */}
          <div className="relative">
            <Zap size={48} className="text-primary stroke-[1.5]" />
            <div className="absolute -inset-2 bg-primary/10 blur-xl rounded-full"></div>
          </div>
          {/* 按钮文字：主标题和副标题 */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-serif text-2xl font-medium tracking-wide">{t('startDivination')}</span>
            <span className="text-[9px] uppercase tracking-[0.3em] opacity-40 font-bold">{t('lenormandOracle')}</span>
          </div>
        </button>
      </motion.div>
    </div>
  );
};
