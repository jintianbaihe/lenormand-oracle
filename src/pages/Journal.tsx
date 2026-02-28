// 导入 React 核心钩子
import React, { useState, useEffect, useRef } from 'react';
// 导入动画库
import { motion, AnimatePresence } from 'motion/react';
// 导入路由钩子
import { useNavigate } from 'react-router-dom';
// 导入图标库
import { MoreHorizontal, Sparkles, Zap, Clover, Ship, Home, TreeDeciduous, Cloud, Snail, Skull, Flower, Sword, Flame, Bird, Baby, Ghost, Shield, Wind, Building, Palmtree, Mountain, Split, Bug, Heart, CircleDot, Book, Mail, User, Moon, Key, Fish, Anchor, Plus, Flower2, Trash2, Share2 } from 'lucide-react';
// 导入类型定义
import { Reading } from '../types';
import { SPREAD_LAYOUTS } from '../constants';
// 导入工具函数
import { cn } from '../utils';
// 导入全局上下文
import { useAppContext } from '../context/AppContext';
// 导入 API 服务
import { apiService } from '../services/apiService';

// 图标映射表，用于根据卡牌数据中的图标名称动态渲染图标组件
const IconMap: Record<string, any> = {
  Zap, Clover, Ship, Home, TreeDeciduous, Cloud, Snail, Skull, Flower, Sword, Flame, Bird, Baby, Ghost, Shield, Sparkles, Wind, Heart, Building, Palmtree, Mountain, Split, Bug, CircleDot, Book, Mail, User, Moon, Key, Fish, Anchor, Plus, Flower2
};

/**
 * 占卜日志页面组件
 * 负责展示用户所有的历史占卜记录，并提供删除和分享功能
 */
export const Journal = () => {
  // 状态：历史记录列表
  const [history, setHistory] = useState<Reading[]>([]);
  // 状态：当前打开操作菜单的记录 ID
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  // 获取翻译函数
  const { t } = useAppContext();
  // 获取路由导航函数
  const navigate = useNavigate();
  // 引用：用于检测点击是否在菜单外部
  const menuRef = useRef<HTMLDivElement>(null);

  // 初始化：从后端加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await apiService.getReadings();
        setHistory(data);
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };
    loadHistory();
  }, []);

  // 副作用：监听全局点击事件，用于关闭打开的操作菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 如果点击的位置不在菜单元素内部，则关闭菜单
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * 处理删除记录
   * @param e - 事件对象
   * @param id - 要删除的记录 ID
   */
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 阻止冒泡，避免触发卡牌点击跳转
    try {
      await apiService.deleteReading(id);
      const updated = history.filter(r => r.id !== id); // 过滤掉目标记录
      setHistory(updated); // 更新状态
      setMenuOpenId(null); // 关闭菜单
    } catch (error) {
      console.error("Failed to delete reading:", error);
      alert(t('deleteFailed') || 'Delete failed');
    }
  };

  /**
   * 处理分享记录
   * @param e - 事件对象
   * @param reading - 要分享的记录数据
   */
  const handleShare = async (e: React.MouseEvent, reading: Reading) => {
    e.stopPropagation(); // 阻止冒泡
    const text = `${reading.title}\n${reading.date}\n\n${reading.interpretation}`;
    // 优先使用 Web Share API（移动端原生分享）
    if (navigator.share) {
      try {
        await navigator.share({
          title: reading.title,
          text: text,
          url: window.location.origin,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // 回退方案：复制到剪贴板
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
    setMenuOpenId(null); // 关闭菜单
  };

  return (
    <div className="flex-1 px-6 pb-32">
      <div className="space-y-4 pt-2">
        {/* 如果没有历史记录，显示空状态提示 */}
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Sparkles size={48} className="mb-4" />
            <p className="text-sm">{t('noHistory')}</p>
          </div>
        ) : (
          // 遍历并渲染历史记录卡片
          history.map((reading, idx) => (
            <motion.div 
              key={reading.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              // 点击卡片跳转到详情页
              onClick={() => navigate(`/journal/${reading.id}`)}
              className="glass-morphism p-5 rounded-2xl flex flex-col gap-4 active:scale-[0.98] transition-all cursor-pointer relative dark:bg-slate-900/40"
            >
              {/* 顶部：标签、日期和操作按钮 */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  {/* 如果是第一条记录，标记为“最新” */}
                  <span className={cn(
                    "text-[10px] uppercase tracking-[0.2em] font-bold",
                    idx === 0 ? "text-primary" : "text-slate-500"
                  )}>
                    {idx === 0 ? t('latest') : t('pastReading')}
                  </span>
                  <span className="text-sm font-medium text-slate-300">{reading.date}</span>
                </div>
                {/* 操作菜单按钮 */}
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === reading.id ? null : reading.id);
                    }}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <MoreHorizontal size={18} className="text-slate-500" />
                  </button>
                  
                  {/* 弹出式操作菜单 */}
                  <AnimatePresence>
                    {menuOpenId === reading.id && (
                      <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-32 glass-morphism rounded-xl shadow-xl z-50 overflow-hidden border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 分享按钮 */}
                        <button 
                          onClick={(e) => handleShare(e, reading)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 text-slate-300 transition-colors text-xs font-medium"
                        >
                          <Share2 size={14} className="text-primary" />
                          {t('share')}
                        </button>
                        <div className="h-[1px] bg-white/5" />
                        {/* 删除按钮 */}
                        <button 
                          onClick={(e) => handleDelete(e, reading.id)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/20 text-red-400 transition-colors text-xs font-medium"
                        >
                          <Trash2 size={14} />
                          {t('delete')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 中部：按牌阵布局展示卡牌缩略图 */}
              {(() => {
                const layoutKey = String(reading.layoutType ?? reading.cards.length ?? '3');
                const layout = SPREAD_LAYOUTS[layoutKey] || SPREAD_LAYOUTS['3'];
                // 计算缩略图所需高度：找出 y 坐标范围，缩放比例 0.28
                const scale = 0.35;
                const cardW = 80 * scale;  // ~22px
                const cardH = 120 * scale; // ~34px
                const ys = layout.slice(0, reading.cards.length).map(p => p.y);
                const xs = layout.slice(0, reading.cards.length).map(p => p.x);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const containerH = (maxY - minY) * scale + cardH + 8;
                const containerW = (maxX - minX) * scale + cardW + 8;
                return (
                  <div className="relative mx-auto" style={{ width: containerW, height: containerH }}>
                    {reading.cards.map((card, idx) => {
                      const pos = layout[idx] || { x: 0, y: 0 };
                      const left = (pos.x - minX) * scale;
                      const top = (pos.y - minY) * scale;
                      return (
                        <div
                          key={card.id}
                          className="absolute flex flex-col items-center justify-between py-1 rounded-md bg-white/5 border border-white/10 dark:bg-slate-900/40 dark:border-primary/10"
                          style={{ width: cardW, height: cardH, left, top }}
                        >
                          <div className="text-indigo-300 flex-1 flex items-center justify-center">
                            {React.createElement(IconMap[card.icon] || Sparkles, { size: 12, strokeWidth: 1.5 })}
                          </div>
                          <span className="text-[5px] uppercase tracking-wider font-bold opacity-50 text-center leading-tight px-0.5">
                            {card.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* 底部：用户问题和 AI 解读摘要预览 */}
              <div className="space-y-2">
                {reading.question && (
                  <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
                    Q: {reading.question}
                  </p>
                )}
                <p className="text-xs leading-relaxed text-slate-400 line-clamp-2 italic font-serif text-base">
                  "{reading.interpretation}"
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};