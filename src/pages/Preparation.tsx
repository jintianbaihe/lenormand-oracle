import React from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

/**
 * 准备页面组件
 * 在正式抽牌前引导用户进行深呼吸和冥想，营造仪式感
 */
export const Preparation = () => {
  const { count, type } = useParams(); // 获取路由参数：抽牌数量和牌阵类型
  const navigate = useNavigate();
  const { t } = useAppContext();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // 点击页面任何地方即可进入正式抽牌流程
      onClick={() => navigate(`/draw/${count}/${type}`)}
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden select-none cursor-pointer touch-none"
    >
      {/* 背景装饰：同心圆动画，模拟呼吸节奏 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-[300px] h-[300px] rounded-full border border-indigo-500/20"
        />
        <motion.div 
          animate={{ scale: [1, 1.03, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-indigo-500/10"
        />
        <motion.div 
          animate={{ scale: [1, 1.02, 1], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full border border-indigo-500/5"
        />
      </div>

      {/* 核心内容区域 */}
      <div className="relative z-20 flex flex-col items-center text-center px-12 space-y-12">
        {/* 引导文字 */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="font-serif text-4xl text-white font-light tracking-wide text-center">{t('takeDeepBreath').replace('。', '').replace('.', '')}</h1>
          <p className="font-serif italic text-xl text-indigo-100/70">{t('focusOnQuestion')}</p>
        </motion.div>

        {/* 呼吸指示器：中间的小圆点动画 */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-20 h-20 rounded-full glass-morphism flex items-center justify-center border-indigo-500/20"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-400/30"
          />
        </motion.div>

        {/* 开始提示文字 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <span className="font-serif italic text-lg text-slate-400 tracking-widest animate-pulse">
            {t('tapToBegin')}
          </span>
        </motion.div>
      </div>

    </motion.div>
  );
};
