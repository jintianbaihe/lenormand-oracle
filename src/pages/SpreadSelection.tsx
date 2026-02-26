import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

/**
 * 牌阵示意图中的小圆点组件
 * @param active - 是否处于激活状态（高亮显示）
 */
const DiagramDot = ({ active = true }: { active?: boolean }) => (
  <div className={`w-1 h-1.5 rounded-[1px] ${active ? 'bg-indigo-300 shadow-[0_0_4px_rgba(165,180,252,0.5)]' : 'bg-white/10'}`} />
);

/**
 * 牌阵示意图组件
 * 根据不同的牌阵类型渲染对应的几何布局
 * @param type - 牌阵类型标识符
 */
const SpreadIcon = ({ type }: { type: string }) => {
  switch (type) {
    case '3': // 三张牌阵：线性排列
      return (
        <div className="flex gap-1">
          <DiagramDot />
          <DiagramDot />
          <DiagramDot />
        </div>
      );
    case '5': // 五张牌阵：十字排列
      return (
        <div className="grid grid-cols-3 grid-rows-3 gap-1 scale-90">
          <div /><DiagramDot /><div />
          <DiagramDot /><DiagramDot /><DiagramDot />
          <div /><DiagramDot /><div />
        </div>
      );
    case '7': // 七张牌阵：圆弧排列
      return (
        <div className="relative w-8 h-8 flex items-center justify-center scale-75">
          <div className="absolute top-0"><DiagramDot /></div>
          <div className="absolute bottom-0"><DiagramDot /></div>
          <div className="absolute left-0"><DiagramDot /></div>
          <div className="absolute right-0"><DiagramDot /></div>
          <div className="absolute top-1.5 left-1.5"><DiagramDot /></div>
          <div className="absolute top-1.5 right-1.5"><DiagramDot /></div>
          <div className="absolute -bottom-1"><DiagramDot /></div>
        </div>
      );
    case '9': // 九张牌阵：3x3 方阵
      return (
        <div className="grid grid-cols-3 gap-1 scale-90">
          <DiagramDot /><DiagramDot /><DiagramDot />
          <DiagramDot /><DiagramDot /><DiagramDot />
          <DiagramDot /><DiagramDot /><DiagramDot />
        </div>
      );
    case 'H': // 希腊十字牌阵
      return (
        <div className="grid grid-cols-3 gap-1 scale-90">
          <DiagramDot /><div /><DiagramDot />
          <DiagramDot /><DiagramDot /><DiagramDot />
          <DiagramDot /><div /><DiagramDot />
        </div>
      );
    case 'GC': // 大十字牌阵
      return (
        <div className="relative w-8 h-8 flex items-center justify-center scale-75">
          <div className="absolute top-0 left-1/2 -translate-x-1/2"><DiagramDot /></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2"><DiagramDot /></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2"><DiagramDot /></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2"><DiagramDot /></div>
          <div className="absolute inset-0 m-auto flex items-center justify-center"><DiagramDot /></div>
        </div>
      );
    default:
      return <DiagramDot />;
  }
};

/**
 * 牌阵选择页面组件
 * 允许用户从多种经典的雷诺曼牌阵中选择一种进行占卜
 */
export const SpreadSelection = () => {
  const navigate = useNavigate();
  const { t } = useAppContext();

  // 定义可用的牌阵列表及其配置
  const spreads = [
    { id: 3, title: t('spread3Title'), subtitle: t('spread3Subtitle'), type: '3', count: 3 },
    { id: 5, title: t('spread5Title'), subtitle: t('spread5Subtitle'), type: '5', count: 5 },
    { id: 7, title: t('spread7Title'), subtitle: t('spread7Subtitle'), type: '7', count: 7 },
    { id: 9, title: t('spread9Title'), subtitle: t('spread9Subtitle'), type: '9', count: 9 },
    { id: 'H', title: t('spreadHTitle'), subtitle: t('spreadHSubtitle'), type: 'H', count: 7 },
    { id: 'GC', title: t('spreadGCTitle'), subtitle: t('spreadGCSubtitle'), type: 'GC', count: 5 },
  ];

  return (
    <div className="flex-1 flex flex-col px-6 pt-4 pb-32 overflow-y-auto no-scrollbar">
      {/* 页面标题和引导语 */}
      <div className="text-center mb-8">
        <p className="text-indigo-400/80 font-medium tracking-[0.2em] uppercase text-[10px] mb-2">{t('advancedDivination')}</p>
        <p className="text-slate-400 text-xs font-light max-w-[240px] mx-auto">{t('selectLayout')}</p>
      </div>

      {/* 牌阵列表渲染 */}
      <div className="space-y-4">
        {spreads.map((spread, idx) => (
          <motion.button
            key={spread.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            // 点击后跳转到准备页面，并传递抽牌数量和牌阵类型
            onClick={() => navigate(`/preparation/${spread.count}/${spread.type}`)}
            className="w-full glass-morphism rounded-2xl p-4 flex items-center gap-5 group active:scale-[0.98] transition-all hover:bg-white/[0.05] border border-white/5"
          >
            {/* 牌阵示意图容器 */}
            <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all">
              <SpreadIcon type={spread.type} />
            </div>
            {/* 牌阵名称和描述 */}
            <div className="text-left flex-1">
              <h3 className="font-medium text-base text-white">{spread.title}</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{spread.subtitle}</p>
            </div>
            {/* 右侧箭头图标 */}
            <ChevronRight size={18} className="text-slate-600 group-hover:text-indigo-300 transition-colors" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
