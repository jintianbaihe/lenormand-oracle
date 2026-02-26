import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Book, HelpCircle, Sparkles, Layers, History, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../utils';

/**
 * 百科页面组件
 * 提供雷诺曼占卜的基础知识、起源、与塔罗的区别、组合解读方法及常见牌阵
 */
export const Wiki = () => {
  const { t, language } = useAppContext();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // 百科内容配置
  const wikiSections = [
    {
      id: 'origin',
      title: t('origin'),
      icon: History,
      content: {
        cn: `雷诺曼牌（Lenormand）是以18世纪著名的法国占卜师玛丽·安妮·雷诺曼（Marie Anne Lenormand）命名的。虽然她本人并未设计这套牌，但她的名声使得这套源自德国“希望之游戏”（Game of Hope）的36张牌在19世纪风靡欧洲。

与塔罗牌的神秘主义背景不同，雷诺曼牌最初是一种社交游戏，其图像取自日常生活中的常见事物（如骑士、船、房子），这使得它的解读更加直观、具体且贴近现实生活。`,
        en: `Lenormand cards are named after Marie Anne Lenormand, a famous French fortune-teller of the 18th century. While she didn't design the deck herself, her fame popularized these 36 cards, which originated from a German game called "The Game of Hope."

Unlike the mystical background of Tarot, Lenormand was originally a parlor game. Its imagery is drawn from everyday life (Rider, Ship, House), making its readings more direct, literal, and grounded in reality.`
      }
    },
    {
      id: 'vsTarot',
      title: t('vsTarot'),
      icon: Layers,
      content: {
        cn: `雷诺曼与塔罗的主要区别在于解读方式：
1. **组合解读**：塔罗牌通常单独解读每张牌的深层含义，而雷诺曼牌像“句子”一样解读，牌与牌之间的组合才是意义所在。
2. **具体 vs 抽象**：塔罗偏向心理、精神和原型层面的探讨；雷诺曼则非常具体，常用于预测实际事件、环境和人物。
3. **没有逆位**：雷诺曼牌通常不使用逆位，牌义的褒贬主要取决于牌本身的极性以及周围牌的影响。
4. **图像直观**：雷诺曼的图像是字面意思，例如“船”通常就代表旅行或距离。`,
        en: `Key differences between Lenormand and Tarot:
1. **Combinations**: Tarot cards are often read individually for deep meaning. Lenormand is read like a "sentence," where the meaning emerges from how cards pair together.
2. **Concrete vs Abstract**: Tarot leans towards psychological and spiritual archetypes. Lenormand is very literal, often predicting actual events and physical circumstances.
3. **No Reversals**: Lenormand cards are typically not read reversed. The tone is set by the card's inherent polarity and surrounding cards.
4. **Literal Imagery**: Imagery is literal; for example, the "Ship" usually represents actual travel or distance.`
      }
    },
    {
      id: 'combinations',
      title: t('combinations'),
      icon: Sparkles,
      content: {
        cn: `解读雷诺曼的核心是“名词+形容词”的语法：
- **第一张牌**：主语/名词（核心主题）。
- **第二张牌**：谓语/形容词（描述或修饰第一张牌）。

**示例**：
- **骑士 (1) + 房子 (4)** = 关于家庭的消息。
- **房子 (4) + 骑士 (1)** = 访客来到家中。
- **云 (6) + 船 (3)** = 模糊或不确定的旅行计划。`,
        en: `The core of Lenormand reading is the "Noun + Adjective" grammar:
- **First Card**: The subject/noun (the core theme).
- **Second Card**: The predicate/adjective (describes or modifies the first card).

**Examples**:
- **Rider (1) + House (4)** = News about a home.
- **House (4) + Rider (1)** = A visitor at the house.
- **Clouds (6) + Ship (3)** = Uncertain or foggy travel plans.`
      }
    },
    {
      id: 'spreads',
      title: t('spreads'),
      icon: Book,
      content: {
        cn: `常见的雷诺曼牌阵包括：
1. **三牌阵**：最基础的牌阵，按顺序解读为“过去-现在-未来”或简单的线性叙事。
2. **五牌阵**：中间一张为核心，周围四张提供背景、挑战和建议。
3. **九宫格 (3x3)**：提供更全面的视角，可以横向、纵向和对角线解读。
4. **大牌阵 (Grand Tableau)**：使用全部36张牌，展示生活中所有领域的完整图景，是雷诺曼的终极技法。`,
        en: `Common Lenormand spreads include:
1. **Three-Card Spread**: The foundation, read as "Past-Present-Future" or a simple linear narrative.
2. **Five-Card Spread**: A central card for the core theme, with four surrounding cards providing context and advice.
3. **Nine-Card Square (3x3)**: Offers a comprehensive view, read horizontally, vertically, and diagonally.
4. **Grand Tableau**: Uses all 36 cards to show a complete picture of all life areas—the ultimate Lenormand technique.`
      }
    },
    {
      id: 'questions',
      title: t('questions'),
      icon: HelpCircle,
      content: {
        cn: `如何提出好问题：
- **具体化**：雷诺曼喜欢具体的问题。与其问“我的未来如何？”，不如问“我下周的面试表现会怎样？”。
- **开放性**：虽然雷诺曼可以回答是非题，但问“关于某事我需要知道什么？”会得到更丰富的细节。
- **避免重复**：不要在短时间内就同一问题反复提问，这通常反映了内心的焦虑而非寻求指引。`,
        en: `How to ask good questions:
- **Be Specific**: Lenormand loves specific questions. Instead of "What is my future?", ask "How will my job interview go next week?".
- **Open-Ended**: While it can answer Yes/No, asking "What do I need to know about...?" provides much richer detail.
- **Avoid Repetition**: Don't ask the same question repeatedly in a short time; this usually reflects anxiety rather than a search for guidance.`
      }
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0a0a0a] pb-32">
      <div className="px-6 py-8">
        <div className="flex flex-col gap-6">
          {wikiSections.map((section, idx) => (
            <motion.div 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <button 
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 shadow-sm dark:shadow-none",
                  activeSection === section.id 
                    ? "bg-indigo-50 dark:bg-white/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                    : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    activeSection === section.id ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                  )}>
                    <section.icon size={20} />
                  </div>
                  <span className={cn(
                    "text-sm font-bold tracking-widest uppercase",
                    activeSection === section.id ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                  )}>
                    {section.title}
                  </span>
                </div>
                <ChevronRight 
                  size={18} 
                  className={cn(
                    "text-slate-400 dark:text-slate-600 transition-transform duration-300",
                    activeSection === section.id ? "rotate-90 text-indigo-500 dark:text-indigo-400" : ""
                  )} 
                />
              </button>

              <AnimatePresence>
                {activeSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-serif whitespace-pre-wrap border-x border-b border-slate-200 dark:border-white/5 rounded-b-2xl bg-white dark:bg-white/[0.02]">
                      <div className="flex items-start gap-3 mb-4">
                        <Info size={14} className="text-indigo-500 dark:text-indigo-400 mt-1 flex-shrink-0" />
                        <p className="text-slate-700 dark:text-slate-300 italic">
                          {section.content[language]}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* 底部装饰 */}
        <div className="mt-12 text-center opacity-20">
          <Sparkles className="mx-auto mb-2 text-indigo-500 dark:text-indigo-400" size={24} />
          <p className="text-[10px] uppercase tracking-[0.5em] text-slate-900 dark:text-white">Wisdom of the Ages</p>
        </div>
      </div>
    </div>
  );
};
