// 导入 React 核心库
import React from 'react';
// 导入路由钩子
import { NavLink, useNavigate } from 'react-router-dom';
// 导入图标库
import { Sparkles, BookOpen, LayoutGrid, Settings, Sun, Moon, ChevronLeft, History } from 'lucide-react';
// 导入工具函数
import { cn } from '../utils';
// 导入全局上下文
import { useAppContext } from '../context/AppContext';

/**
 * Navbar 组件：底部固定导航栏
 * 包含主页、日志和卡牌库三个主要入口
 */
export const Navbar = () => {
  // 获取翻译函数
  const { t } = useAppContext();
  
  // 定义导航项配置
  const navItems = [
    { to: '/', icon: Sparkles, label: t('divination') },
    { to: '/journal', icon: History, label: t('journal') },
    { to: '/cards', icon: LayoutGrid, label: t('cards') },
    { to: '/wiki', icon: BookOpen, label: t('wiki') },
  ];

  return (
    // 容器：绝对定位在底部，设置 z-index 确保在最上层，pointer-events-none 允许点击穿透背景
    <nav className="absolute bottom-0 left-0 right-0 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-4 px-6 z-40 pointer-events-none">
      {/* 导航栏主体：毛玻璃效果，圆角矩形，居中显示 */}
      <div className="max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto glass-morphism rounded-full p-2 flex justify-between items-center shadow-2xl shadow-black/40 pointer-events-auto">
        {navItems.map((item) => (
          // 使用 NavLink 自动处理激活状态
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors",
                // 激活时显示主色调，未激活时显示灰色
                isActive ? "text-primary" : "text-slate-400 hover:text-indigo-300"
              )
            }
          >
            {/* 渲染图标 */}
            <item.icon size={22} strokeWidth={2} />
            {/* 渲染标签文字 */}
            <p className="text-[9px] font-bold uppercase tracking-widest">{item.label}</p>
          </NavLink>
        ))}
      </div>
      {/* 底部装饰条：模拟移动端系统的 Home 指示条 */}
      <div className="h-1 w-32 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mt-6" />
    </nav>
  );
};

/**
 * Header 组件：顶部标题栏
 * 支持返回按钮、标题、副标题、语言切换和主题切换
 */
export const Header = ({ title, subtitle, showBack = false, onBack }: { title?: string, subtitle?: string, showBack?: boolean, onBack?: () => void }) => {
  // 从上下文获取状态和操作方法
  const { language, setLanguage, theme, toggleTheme, user } = useAppContext();
  const navigate = useNavigate();

  return (
    // 容器：弹性布局，两端对齐
    <header className="flex items-center justify-between px-6 pt-[calc(3.5rem+env(safe-area-inset-top,0px))] pb-4 relative z-30">
      <div className="flex items-center gap-2">
        {/* 如果 showBack 为 true，显示返回按钮；否则显示语言切换按钮 */}
        {showBack ? (
          // 返回按钮：点击触发 onBack 回调
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center glass-morphism rounded-full transition-all active:scale-95"
          >
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        ) : (
          // 语言切换按钮：点击在 EN 和 CN 之间切换
          <button 
            onClick={() => setLanguage(language === 'en' ? 'cn' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 glass-morphism rounded-full text-[10px] font-bold tracking-tighter uppercase transition-all active:scale-95"
          >
            <span className={cn(language === 'en' ? "text-primary" : "opacity-40")}>EN</span>
            <span className="opacity-20">|</span>
            <span className={cn(language === 'cn' ? "text-primary" : "opacity-40")}>CN</span>
          </button>
        )}
        
        {/* 如果不是返回状态，显示主题切换按钮 */}
        {!showBack && (
          <button 
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center glass-morphism rounded-full transition-all active:scale-95"
          >
            {/* 根据当前主题显示太阳或月亮图标 */}
            {theme === 'dark' ? <Moon size={16} className="text-indigo-300" /> : <Sun size={16} className="text-amber-500" />}
          </button>
        )}
      </div>

      {/* 中间标题区域：居中显示标题和副标题 */}
      <div className="flex flex-col items-center">
        {title && <h2 className={cn("font-serif text-xl tracking-wide", "text-slate-900 dark:text-white")}>{title}</h2>}
        {subtitle && <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-indigo-600 dark:text-indigo-300/80">{subtitle}</p>}
      </div>

      {/* 右侧用户头像：点击可进入个人设置 */}
      <button 
        onClick={() => navigate('/settings')}
        className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-sm active:scale-95 transition-transform bg-slate-100 dark:bg-white/5"
      >
        {user?.avatar ? (
          <img 
            alt="User Profile" 
            className="w-full h-full object-cover" 
            src={user.avatar}
            onError={(e) => {
              // 如果头像加载失败，显示默认图标
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515532760646-7d63e925263a?auto=format&fit=crop&q=80&w=200&h=200";
            }}
          />
        ) : (
          <History size={20} className="text-slate-400" />
        )}
      </button>
    </header>
  );
};
