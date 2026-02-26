// 导入 React 核心钩子
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';

// 定义支持的语言类型
type Language = 'en' | 'cn';
// 定义支持的主题类型
type Theme = 'dark' | 'light';

// 定义 AppContext 的接口，包含状态和操作方法
interface AppContextType {
  language: Language; // 当前语言
  setLanguage: (lang: Language) => void; // 设置语言的方法
  theme: Theme; // 当前主题
  toggleTheme: () => void; // 切换主题的方法
  t: (key: string, params?: Record<string, any>) => string; // 国际化翻译函数
  user: User | null;
  login: (phone: string, code: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

// 国际化资源字典
const translations: Record<Language, Record<string, string>> = {
  en: {
    // ... 英文翻译条目
    divination: "Divination",
    // ... (省略部分以保持简洁，实际代码中保留所有)
    journal: "Journal",
    cards: "Cards",
    config: "Config",
    yourDailyPath: "Your Daily Path",
    howIsYourDay: "How is your day",
    today: "today?",
    quietMind: "Quiet your mind and let the cards illuminate the unseen currents of your day.",
    startDivination: "Start Divination",
    lenormandOracle: "Lenormand Oracle",
    dailyInsight: "Daily Insight",
    chooseSpread: "Choose Spread",
    selectFocus: "Select your focus",
    spreadDepth: "The number of cards determines the depth of the revelation.",
    card1: "1 Card",
    card3: "3 Cards",
    card5: "5 Cards",
    dailyEssence: "Daily Essence",
    pastPresentFuture: "Past, Present, Future",
    deepReflection: "Deep Reflection",
    dailyReading: "Daily Reading",
    focusIntent: "Focus your intent",
    drawInstruction: "Focus your intent and draw your first card.",
    drawnCount: "Drawn {count} of {total} cards.",
    drawNext: "Draw {next} of {total} Cards",
    readingResult: "Reading Result",
    consultingOracle: "Consulting the Oracle...",
    guidance: "Guidance",
    latest: "Latest",
    pastReading: "Past Reading",
    noHistory: "Your journey has yet to be recorded.",
    comingSoon: "Coming soon...",
    cardLibrary: "Card Library",
    searchCards: "Search cards...",
    all: "All",
    nature: "Nature",
    objects: "Objects",
    people: "People",
    celestial: "Celestial",
    positive: "Positive",
    negative: "Negative",
    neutral: "Neutral",
    hearts: "Hearts",
    diamonds: "Diamonds",
    spades: "Spades",
    clubs: "Clubs",
    wiki: "Wiki",
    origin: "Origin",
    vsTarot: "Lenormand vs Tarot",
    combinations: "Combinations",
    spreads: "Spreads",
    questions: "Asking Questions",
    coreMeaning: "Core Meaning",
    extendedMeaning: "Extended Meaning",
    career: "Career",
    love: "Love/Emotion",
    health: "Health/Body",
    person: "Person",
    close: "Close",
    cancel: "Cancel",
    entryDetails: "Entry Details",
    aiInterpretation: "AI Interpretation",
    yourReflection: "Your Reflection",
    reflectionPlaceholder: "How did this reading manifest in your day? Record any thoughts or events here...",
    saveUpdates: "Save Updates",
    saveResult: "Save Result",
    saved: "Saved",
    delete: "Delete",
    share: "Share",
    preparation: "Preparation",
    centerYourself: "Center yourself",
    takeDeepBreath: "Take a deep breath.",
    focusOnQuestion: "Focus on your question.",
    tapToBegin: "Tap anywhere to begin the ritual",
    mindfulPreparation: "Mindful Preparation",
    tapToFlip: "Tap cards to reveal their secrets",
    allCardsFlipped: "The path is revealed",
    advancedDivination: "Advanced Divination",
    selectLayout: "Select a layout for your inquiry",
    spread3Title: "3 Cards",
    spread3Subtitle: "Past - Present - Future",
    spread5Title: "5 Cards",
    spread5Subtitle: "The Mystic Cross",
    spread7Title: "7 Cards",
    spread7Subtitle: "The Ellipsis Path",
    spread9Title: "9 Cards",
    spread9Subtitle: "3x3 Square Portrait",
    spreadHTitle: "H-Spread",
    spreadHTitle_Greek: "Greek Cross",
    spreadHSubtitle: "Bridges & Connections",
    spreadGCTitle: "Grand Cross",
    spreadGCSubtitle: "Universal Synthesis",
    login: "Login",
    register: "Register",
    mobileNumber: "Mobile Number",
    verificationCode: "Verification Code",
    getCode: "Get Code",
    agreeTerms: "I agree to the Terms and Privacy Policy",
    registerAndEnter: "Register & Enter",
    orContinueWith: "Or continue with",
    wechat: "WeChat",
    profileSettings: "Profile Settings",
    username: "Username",
    avatar: "Avatar",
    saveChanges: "Save Changes",
    logout: "Logout",
    startJourney: "Start Your Journey",
    cardsWaiting: "The cards are waiting",
    codeSent: "Verification code sent!",
  },
  cn: {
    // ... 中文翻译条目
    divination: "占卜",
    // ... (省略部分以保持简洁，实际代码中保留所有)
    journal: "日志",
    cards: "卡牌",
    config: "设置",
    yourDailyPath: "你的每日路径",
    howIsYourDay: "你今天过得",
    today: "怎么样？",
    quietMind: "静下心来，让卡牌照亮你这一天中未见的暗流。",
    startDivination: "开始占卜",
    lenormandOracle: "雷诺曼神谕",
    dailyInsight: "每日洞察",
    chooseSpread: "选择牌阵",
    selectFocus: "选择你的焦点",
    spreadDepth: "卡牌的数量决定了启示的深度。",
    card1: "1张牌阵",
    card3: "3张牌阵",
    card5: "5张牌阵",
    dailyEssence: "每日精髓",
    pastPresentFuture: "过去、现在、未来",
    deepReflection: "深度反思",
    dailyReading: "每日阅读",
    focusIntent: "专注你的意图",
    drawInstruction: "专注你的意图，抽取你的第一张牌。",
    drawnCount: "已抽取 {total} 张牌中的 {count} 张。",
    drawNext: "抽取第 {next}/{total} 张牌",
    readingResult: "占卜结果",
    consultingOracle: "正在咨询神谕...",
    guidance: "指引",
    latest: "最新",
    pastReading: "往期阅读",
    noHistory: "你的旅程尚未被记录。",
    comingSoon: "即将推出...",
    delete: "删除",
    share: "分享",
    cardLibrary: "卡牌库",
    searchCards: "搜索卡牌...",
    all: "全部",
    nature: "自然",
    objects: "物品",
    people: "人物",
    celestial: "天体",
    positive: "积极",
    negative: "消极",
    neutral: "中性",
    hearts: "红心 ♥",
    diamonds: "方块 ♦",
    spades: "黑桃 ♠",
    clubs: "梅花 ♣",
    wiki: "百科",
    origin: "起源",
    vsTarot: "与塔罗的区别",
    combinations: "组合解读",
    spreads: "常见牌阵",
    questions: "如何提问",
    coreMeaning: "核心含义",
    extendedMeaning: "引申含义",
    career: "事业",
    love: "情感",
    health: "身体",
    person: "人物",
    close: "关闭",
    cancel: "取消",
    entryDetails: "记录详情",
    aiInterpretation: "AI 解读",
    yourReflection: "你的感悟",
    reflectionPlaceholder: "这次占卜在你的生活中是如何体现的？在这里记录你的想法或事件...",
    saveUpdates: "保存更新",
    saveResult: "保存结果",
    saved: "已保存",
    preparation: "准备",
    centerYourself: "静心冥想",
    takeDeepBreath: "深呼吸。",
    focusOnQuestion: "专注于你的问题。",
    tapToBegin: "点击任意位置开始仪式",
    mindfulPreparation: "正念准备",
    tapToFlip: "点击翻转牌面查看结果",
    allCardsFlipped: "路径已揭示",
    advancedDivination: "高级占卜",
    selectLayout: "为你的咨询选择一个布局",
    spread3Title: "3张牌阵",
    spread3Subtitle: "过去 - 现在 - 未来",
    spread5Title: "5张牌阵",
    spread5Subtitle: "神秘十字",
    spread7Title: "7张牌阵",
    spread7Subtitle: "椭圆路径",
    spread9Title: "9张牌阵",
    spread9Subtitle: "3x3 方阵",
    spreadHTitle: "H型牌阵",
    spreadHSubtitle: "桥梁与连接",
    spreadGCTitle: "大十字",
    spreadGCSubtitle: "宇宙综合",
    login: "登录",
    register: "注册",
    mobileNumber: "手机号码",
    verificationCode: "验证码",
    getCode: "获取验证码",
    agreeTerms: "我同意服务条款和隐私政策",
    registerAndEnter: "注册并进入",
    orContinueWith: "或者使用以下方式继续",
    wechat: "微信",
    profileSettings: "个人设置",
    username: "用户名",
    avatar: "头像",
    saveChanges: "保存修改",
    logout: "退出登录",
    startJourney: "开启你的旅程",
    cardsWaiting: "卡牌正在等待",
    codeSent: "验证码已发送！",
  }
};

// 创建 Context 对象，初始值为 undefined
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AppProvider 组件：提供全局状态
 * 包装在应用最外层，使得子组件可以访问语言、主题等全局配置
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 语言状态，默认为中文 'cn'
  const [language, setLanguage] = useState<Language>('cn');
  // 主题状态，默认为深色 'dark'
  const [theme, setTheme] = useState<Theme>('dark');
  // 用户状态
  const [user, setUser] = useState<User | null>(null);

  // 初始化加载用户信息
  useEffect(() => {
    const savedToken = localStorage.getItem('lenormand_token');
    const savedUser = localStorage.getItem('lenormand_user');
    
    if (savedToken && savedUser) {
      apiService.setAuthToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // 验证token是否仍然有效
      apiService.getCurrentUser().catch(() => {
        // Token无效，清除本地存储
        localStorage.removeItem('lenormand_token');
        localStorage.removeItem('lenormand_user');
        setUser(null);
      });
    }
  }, []);

  const login = async (phone: string, code: string) => {
    try {
      const { user, token } = await apiService.login(phone, code);
      setUser(user);
      localStorage.setItem('lenormand_token', token);
      localStorage.setItem('lenormand_user', JSON.stringify(user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      apiService.clearAuthToken();
      localStorage.removeItem('lenormand_token');
      localStorage.removeItem('lenormand_user');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await apiService.updateProfile(updates);
        setUser(updatedUser);
        localStorage.setItem('lenormand_user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Profile update failed:', error);
        throw error;
      }
    }
  };

  const isAuthenticated = !!user;

  // 副作用：当主题切换时，动态修改 HTML 根元素的 class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // 切换主题的便捷方法
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  /**
   * 国际化翻译核心函数
   */
  const t = (key: string, params?: Record<string, any>) => {
    let text = translations[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v.toString());
      });
    }
    return text;
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, theme, toggleTheme, t,
      user, login, logout, updateProfile, isAuthenticated
    }}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * 自定义 Hook：方便在组件中快速获取 AppContext
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
