import { Type } from "@google/genai";

/**
 * 定义单张雷诺曼卡牌的接口
 */
export interface Card {
  id: number;           // 卡牌编号 (1-36)
  name: string;         // 英文名称
  nameCn: string;       // 中文名称
  keyword: string;      // 核心关键词
  icon: string;         // 对应的 Lucide 图标名称
  polarity: 'positive' | 'negative' | 'neutral'; // 极性：积极、消极、中性
  suit: 'hearts' | 'diamonds' | 'spades' | 'clubs'; // 扑克牌花色
  category: 'nature' | 'objects' | 'people' | 'celestial'; // 分类：自然、物体、人物、天体
  meanings: {
    en: {
      core: string;     // 英文核心含义
      extended: string; // 英文扩展含义
      career: string;   // 事业
      love: string;     // 情感
      health: string;   // 身体
      person: string;   // 人物
    };
    cn: {
      core: string;     // 中文核心含义
      extended: string; // 中文扩展含义
      career: string;   // 事业
      love: string;     // 情感
      health: string;   // 身体
      person: string;   // 人物
    };
  };
}

/**
 * 雷诺曼 36 张标准卡牌数据定义
 */
export const LENORMAND_CARDS: Card[] = [
  { 
    id: 1, name: "The Rider", nameCn: "骑士", keyword: "News, speed", icon: "Zap", category: 'people', polarity: 'neutral', suit: 'hearts',
    meanings: {
      en: { 
        core: "News, messages, visitors.", 
        extended: "Represents fast movement, physical activity, and new information arriving shortly.",
        career: "New job offer, business news, active work environment.",
        love: "A new person entering your life, a message from a lover, fast-moving romance.",
        health: "Legs, feet, joints. Physical activity is recommended.",
        person: "A young, athletic, or active person; a messenger."
      },
      cn: { 
        core: "消息，速度，访客。", 
        extended: "代表快速的移动、体力活动以及即将到来的新信息。",
        career: "新的工作机会，业务消息，活跃的工作环境。",
        love: "新的人进入生活，恋人的消息，进展迅速的感情。",
        health: "腿，脚，关节。建议进行体力活动。",
        person: "年轻、运动型或活跃的人；送信人。"
      }
    }
  },
  { 
    id: 2, name: "The Clover", nameCn: "幸运草", keyword: "Luck, small happiness", icon: "Clover", category: 'nature', polarity: 'positive', suit: 'diamonds',
    meanings: {
      en: { 
        core: "Luck, opportunity, brief joy.", 
        extended: "A positive card indicating small strokes of luck and short-term happiness.",
        career: "A lucky break, short-term success, a pleasant surprise at work.",
        love: "Brief but happy encounter, a second chance, lighthearted romance.",
        health: "Quick recovery, herbs, nervous system.",
        person: "An optimistic, lucky, or lighthearted person."
      },
      cn: { 
        core: "运气，小确幸。", 
        extended: "一张积极的牌，预示着小小的运气和短期的快乐。",
        career: "幸运的突破，短期成功，工作中愉快的惊喜。",
        love: "短暂但快乐的相遇，第二次机会，轻松的浪漫。",
        health: "快速康复，草药，神经系统。",
        person: "乐观、幸运或轻松愉快的人。"
      }
    }
  },
  { 
    id: 3, name: "The Ship", nameCn: "船", keyword: "Travel, transition", icon: "Ship", category: 'objects', polarity: 'neutral', suit: 'spades',
    meanings: {
      en: { 
        core: "Travel, distance, commerce.", 
        extended: "Relates to long-distance travel, business ventures, and transitions in life.",
        career: "International business, expansion, a journey related to work.",
        love: "Long-distance relationship, moving forward, a romantic getaway.",
        health: "Liver, gall bladder, circulation. Motion sickness.",
        person: "A traveler, foreigner, or someone from afar."
      },
      cn: { 
        core: "旅行，过渡，商业。", 
        extended: "涉及长途旅行、商业冒险和生活中的过渡。",
        career: "国际业务，扩张，与工作相关的旅行。",
        love: "异地恋，向前迈进，浪漫的旅行。",
        health: "肝脏，胆囊，循环系统。晕车/船。",
        person: "旅行者，外国人，或来自远方的人。"
      }
    }
  },
  { 
    id: 4, name: "The House", nameCn: "房子", keyword: "Home, stability", icon: "Home", category: 'objects', polarity: 'positive', suit: 'hearts',
    meanings: {
      en: { 
        core: "Home, family, security.", 
        extended: "Represents your physical home, family matters, and a sense of belonging.",
        career: "Working from home, family business, a stable and secure job.",
        love: "Stable relationship, living together, family-oriented romance.",
        health: "The body as a whole, bones, general well-being.",
        person: "A family member, a homebody, or a reliable person."
      },
      cn: { 
        core: "家庭，稳定，安全。", 
        extended: "代表你的物理家园、家庭事务和归属感。",
        career: "在家办公，家族企业，稳定且安全的工作。",
        love: "稳定的关系，同居，以家庭为中心的浪漫。",
        health: "身体整体，骨骼，整体健康状况。",
        person: "家庭成员，宅男/宅女，或可靠的人。"
      }
    }
  },
  { 
    id: 5, name: "The Tree", nameCn: "树", keyword: "Health, growth", icon: "TreeDeciduous", category: 'nature', polarity: 'neutral', suit: 'hearts',
    meanings: {
      en: { 
        core: "Health, longevity, roots.", 
        extended: "Indicates long-term growth, health issues, and deep-seated ancestral connections.",
        career: "Slow but steady growth, a long-term career path, stability.",
        love: "Deep-rooted connection, a long-lasting relationship, karmic bond.",
        health: "Lungs, vitality, chronic conditions. Needs fresh air.",
        person: "A calm, patient, or mature person; a healer."
      },
      cn: { 
        core: "健康，成长，根基。", 
        extended: "预示着长期的增长、健康问题和根深蒂固的祖先联系。",
        career: "缓慢但稳步的增长，长期的职业道路，稳定性。",
        love: "根深蒂固的联系，持久的关系，业力纽带。",
        health: "肺部，生命力，慢性状况。需要新鲜空气。",
        person: "冷静、耐心或成熟的人；治愈者。"
      }
    }
  },
  { 
    id: 6, name: "The Clouds", nameCn: "云", keyword: "Confusion, uncertainty", icon: "Cloud", category: 'celestial', polarity: 'negative', suit: 'clubs',
    meanings: {
      en: { 
        core: "Confusion, doubt, hidden things.", 
        extended: "Suggests a period of mental fog or temporary obstacles that obscure the truth.",
        career: "Uncertainty at work, lack of clarity, temporary setbacks.",
        love: "Confusion in a relationship, hidden motives, emotional fog.",
        health: "Respiratory system, mental health, undiagnosed issues.",
        person: "A confused, moody, or secretive person."
      },
      cn: { 
        core: "困惑，不确定，阴霾。", 
        extended: "暗示一段时期的精神迷雾或暂时掩盖真相的障碍。",
        career: "工作中的不确定性，缺乏清晰度，暂时的挫折。",
        love: "关系中的困惑，隐藏的动机，情感迷雾。",
        health: "呼吸系统，心理健康，未确诊的问题。",
        person: "困惑、情绪化或神秘的人。"
      }
    }
  },
  { 
    id: 7, name: "The Snake", nameCn: "蛇", keyword: "Betrayal, complexity", icon: "Snail", category: 'nature', polarity: 'negative', suit: 'clubs',
    meanings: {
      en: { 
        core: "Betrayal, desire, complications.", 
        extended: "Warns of deceit, hidden agendas, or a complex person in your life.",
        career: "Office politics, a rival, complex problems that need careful handling.",
        love: "Jealousy, betrayal, a complicated or seductive third party.",
        health: "Digestive system, intestines. Be wary of hidden symptoms.",
        person: "A clever, seductive, or untrustworthy person; a rival."
      },
      cn: { 
        core: "背叛，复杂，诱惑。", 
        extended: "警告欺骗、隐藏的议图或你生活中一个复杂的人。",
        career: "办公室政治，竞争对手，需要谨慎处理的复杂问题。",
        love: "嫉妒，背叛，复杂或有诱惑力的第三方。",
        health: "消化系统，肠道。提防隐藏的症状。",
        person: "聪明、有诱惑力或不可信的人；竞争对手。"
      }
    }
  },
  { 
    id: 8, name: "The Coffin", nameCn: "棺材", keyword: "Ending, transformation", icon: "Skull", category: 'objects', polarity: 'negative', suit: 'diamonds',
    meanings: {
      en: { 
        core: "Endings, illness, stagnation.", 
        extended: "Represents a significant closure, a period of rest, or a necessary transformation.",
        career: "End of a project, job loss, a period of inactivity.",
        love: "The end of a relationship, deep sadness, a period of mourning.",
        health: "Serious illness, surgery, the need for complete rest.",
        person: "Someone going through a major ending or transformation."
      },
      cn: { 
        core: "结束，转型，停滞。", 
        extended: "代表重大的终结、休息期或必要的转型。",
        career: "项目结束，失业，一段不活跃的时期。",
        love: "关系的终结，深切的悲伤，哀悼期。",
        health: "严重疾病，手术，需要完全休息。",
        person: "正在经历重大终结或转型的人。"
      }
    }
  },
  { 
    id: 9, name: "The Flowers", nameCn: "花束", keyword: "Gift, joy", icon: "Flower", category: 'nature', polarity: 'positive', suit: 'spades',
    meanings: {
      en: { 
        core: "Gifts, beauty, invitations.", 
        extended: "A card of happiness, social recognition, and pleasant surprises.",
        career: "A promotion, a creative project, a pleasant work environment.",
        love: "A new romance, a gift from a lover, a happy social outing.",
        health: "Recovery, beauty treatments, allergies.",
        person: "A charming, beautiful, or artistic person."
      },
      cn: { 
        core: "礼物，喜悦，美丽。", 
        extended: "一张代表幸福、社会认可和愉快惊喜的牌。",
        career: "晋升，创意项目，愉快的工作环境。",
        love: "新的浪漫，恋人的礼物，快乐的社交活动。",
        health: "康复，美容护理，过敏。",
        person: "有魅力、美丽或有艺术气息的人。"
      }
    }
  },
  { 
    id: 10, name: "The Scythe", nameCn: "镰刀", keyword: "Sudden cut, danger", icon: "Sword", category: 'objects', polarity: 'negative', suit: 'diamonds',
    meanings: {
      en: { 
        core: "Sudden break, harvest, danger.", 
        extended: "Indicates a quick decision, a sudden ending, or a physical injury.",
        career: "Sudden resignation, a sharp decision, a clean break from a job.",
        love: "Sudden breakup, a sharp disagreement, a painful cut.",
        health: "Surgery, sharp pain, sudden injury. Be careful with tools.",
        person: "A decisive, sharp, or potentially dangerous person."
      },
      cn: { 
        core: "突然切断，危险，收获。", 
        extended: "预示着快速的决定、突然的结束或身体受伤。",
        career: "突然辞职，果断的决定，与工作的彻底断绝。",
        love: "突然分手，激烈的分歧，痛苦的割舍。",
        health: "手术，剧痛，突然受伤。小心使用工具。",
        person: "果断、敏锐或具有潜在危险的人。"
      }
    }
  },
  { 
    id: 11, name: "The Whip", nameCn: "鞭子", keyword: "Conflict, repetition", icon: "Flame", category: 'objects', polarity: 'negative', suit: 'clubs',
    meanings: {
      en: { 
        core: "Arguments, repetitive actions, pain.", 
        extended: "Relates to chronic stress, physical exercise, or verbal disputes.",
        career: "Conflict at work, repetitive tasks, a high-pressure environment.",
        love: "Arguments, sexual tension, a repetitive pattern in romance.",
        health: "Muscles, chronic pain, physical exhaustion.",
        person: "A competitive, aggressive, or physically active person."
      },
      cn: { 
        core: "冲突，重复，争论。", 
        extended: "涉及长期压力、体育锻炼或言语纠纷。",
        career: "工作中的冲突，重复性任务，高压环境。",
        love: "争论，性张力，浪漫关系中的重复模式。",
        health: "肌肉，慢性疼痛，体力耗尽。",
        person: "有竞争心、侵略性或体力活跃的人。"
      }
    }
  },
  { 
    id: 12, name: "The Birds", nameCn: "鸟", keyword: "Communication, gossip", icon: "Bird", category: 'nature', polarity: 'neutral', suit: 'diamonds',
    meanings: {
      en: { 
        core: "Talk, excitement, anxiety.", 
        extended: "Represents verbal communication, phone calls, and nervous energy.",
        career: "Meetings, interviews, a lot of phone calls and emails.",
        love: "Nervous excitement, a lot of talking, a couple.",
        health: "Vocal cords, throat, nervous energy.",
        person: "A talkative person, a couple, or someone who is anxious."
      },
      cn: { 
        core: "沟通，八卦，焦虑。", 
        extended: "代表言语交流、电话和紧张的能量。",
        career: "会议，面试，大量的电话和电子邮件。",
        love: "紧张的兴奋，大量的交谈，一对伴侣。",
        health: "声带，喉咙，紧张的能量。",
        person: "健谈的人，一对伴侣，或焦虑的人。"
      }
    }
  },
  { 
    id: 13, name: "The Child", nameCn: "小孩", keyword: "New beginnings", icon: "Baby", category: 'people', polarity: 'neutral', suit: 'spades',
    meanings: {
      en: { 
        core: "Innocence, smallness, new starts.", 
        extended: "Relates to children, new projects, and a fresh perspective.",
        career: "A new project, a junior position, a fresh start in a career.",
        love: "New romance, innocence, a child in the family.",
        health: "Childhood illnesses, small issues, fertility.",
        person: "A child, a young person, or someone naive."
      },
      cn: { 
        core: "新开始，纯真，渺小。", 
        extended: "涉及儿童、新项目和新鲜的视角。",
        career: "新项目，初级职位，职业生涯的新开始。",
        love: "新的浪漫，纯真，家庭中的孩子。",
        health: "小儿疾病，小问题，生育能力。",
        person: "孩子，年轻人，或天真的人。"
      }
    }
  },
  { 
    id: 14, name: "The Fox", nameCn: "狐狸", keyword: "Cunning, work", icon: "Ghost", category: 'nature', polarity: 'neutral', suit: 'clubs',
    meanings: {
      en: { 
        core: "Work, strategy, deceit.", 
        extended: "Suggests being clever, focusing on your job, or watching out for traps.",
        career: "Your daily job, being strategic at work, a clever colleague.",
        love: "A relationship that needs strategy, hidden motives, or a 'work' romance.",
        health: "Nose, smell, minor health issues that need attention.",
        person: "A clever, strategic, or potentially dishonest person; a worker."
      },
      cn: { 
        core: "狡猾，工作，策略。", 
        extended: "建议保持聪明、专注于工作或提防陷阱。",
        career: "你的日常工作，在工作中讲究策略，聪明的同事。",
        love: "需要策略的关系，隐藏的动机，或“办公室”恋情。",
        health: "鼻子，嗅觉，需要注意的小健康问题。",
        person: "聪明、有策略或可能不诚实的人；劳动者。"
      }
    }
  },
  { 
    id: 15, name: "The Bear", nameCn: "熊", keyword: "Power, protection", icon: "Shield", category: 'nature', polarity: 'neutral', suit: 'clubs',
    meanings: {
      en: { 
        core: "Strength, finances, authority.", 
        extended: "Represents a powerful figure, financial stability, or protective energy.",
        career: "Financial success, a powerful boss, a stable and strong position.",
        love: "A protective partner, a strong and stable relationship, dominance.",
        health: "Weight issues, nutrition, stomach, strength.",
        person: "A powerful, protective, or wealthy person; a mother figure."
      },
      cn: { 
        core: "力量，保护，财务。", 
        extended: "代表一个有权势的人物、财务稳定或保护性能量。",
        career: "财务成功，有权势的老板，稳定且强大的职位。",
        love: "有保护欲的伴侣，稳固而稳定的关系，主导地位。",
        health: "体重问题，营养，胃部，力量。",
        person: "有权势、有保护欲或富有的人；母亲形象。"
      }
    }
  },
  { 
    id: 16, name: "The Stars", nameCn: "星星", keyword: "Hope, inspiration", icon: "Sparkles", category: 'celestial', polarity: 'positive', suit: 'hearts',
    meanings: {
      en: { 
        core: "Hope, guidance, clarity.", 
        extended: "A card of success, following your dreams, and finding your path.",
        career: "Success, recognition, a clear path forward in your career.",
        love: "Hopeful romance, finding 'the one', a dream relationship.",
        health: "Skin, nerves, general improvement in health.",
        person: "An inspirational, famous, or visionary person."
      },
      cn: { 
        core: "希望，灵感，清晰。", 
        extended: "一张代表成功、追随梦想和寻找路径的牌。",
        career: "成功，认可，职业生涯中清晰的前进道路。",
        love: "充满希望的浪漫，找到“那个人”，梦想中的关系。",
        health: "皮肤，神经，健康状况的整体改善。",
        person: "有启发性、著名或有远见的人。"
      }
    }
  },
  { 
    id: 17, name: "The Stork", nameCn: "鹳", keyword: "Change, improvement", icon: "Wind", category: 'nature', polarity: 'neutral', suit: 'hearts',
    meanings: {
      en: { 
        core: "Change, movement, birth.", 
        extended: "Indicates positive changes, relocation, or new developments.",
        career: "Relocation for work, a promotion, a positive shift in duties.",
        love: "Positive change in a relationship, moving in together, birth of a child.",
        health: "Pregnancy, recovery, legs.",
        person: "Someone who is flexible, changing, or a mother."
      },
      cn: { 
        core: "变化，改进，移动。", 
        extended: "预示着积极的变化、搬迁或新的发展。",
        career: "因工作搬迁，晋升，职责的积极转变。",
        love: "关系的积极变化，同居，孩子的出生。",
        health: "怀孕，康复，腿部。",
        person: "灵活、多变的人或母亲。"
      }
    }
  },
  { 
    id: 18, name: "The Dog", nameCn: "狗", keyword: "Friendship, loyalty", icon: "Heart", category: 'people', polarity: 'positive', suit: 'hearts',
    meanings: {
      en: { 
        core: "Loyalty, trust, a friend.", 
        extended: "Represents a faithful companion, a reliable person, or deep trust.",
        career: "A loyal colleague, a trustworthy business partner, a stable job.",
        love: "A faithful partner, a relationship built on trust, a friend becoming a lover.",
        health: "Senses (hearing, sight), general well-being, a doctor.",
        person: "A loyal friend, a companion, or a trustworthy person."
      },
      cn: { 
        core: "友谊，忠诚，信任。", 
        extended: "代表忠实的伴侣、可靠的人或深厚的信任。",
        career: "忠诚的同事，值得信赖的业务伙伴，稳定的工作。",
        love: "忠诚的伴侣，建立在信任基础上的关系，朋友变恋人。",
        health: "感官（听觉、视觉），整体健康，医生。",
        person: "忠实的朋友，伴侣，或值得信赖的人。"
      }
    }
  },
  { 
    id: 19, name: "The Tower", nameCn: "塔", keyword: "Authority, isolation", icon: "Building", category: 'objects', polarity: 'neutral', suit: 'spades',
    meanings: {
      en: { 
        core: "Official matters, institutions, ego.", 
        extended: "Relates to large corporations, legal issues, or standing alone.",
        career: "A large corporation, government job, a high-ranking position.",
        love: "A distant or formal relationship, seeking higher standards.",
        health: "Spine, back, longevity, a hospital.",
        person: "An ambitious, formal, or lonely person; an official."
      },
      cn: { 
        core: "权威，孤立，机构。", 
        extended: "涉及大型企业、法律问题或独立自主。",
        career: "大型企业，政府工作，高层职位。",
        love: "疏远或正式的关系，追求更高的标准。",
        health: "脊柱，背部，长寿，医院。",
        person: "有野心、正式或孤独的人；官员。"
      }
    }
  },
  { 
    id: 20, name: "The Garden", nameCn: "花园", keyword: "Social, public", icon: "Palmtree", category: 'nature', polarity: 'neutral', suit: 'spades',
    meanings: {
      en: { 
        core: "Public events, social circles, nature.", 
        extended: "Represents the community, networking, and being seen in public.",
        career: "Networking, public relations, a meeting or seminar.",
        love: "Meeting someone in public, a social relationship, a group date.",
        health: "Group therapy, fresh air, spa, public health.",
        person: "A socialite, a public figure, or someone who loves nature."
      },
      cn: { 
        core: "社交，公共，自然。", 
        extended: "代表社区、网络社交和在公共场合露面。",
        career: "建立人脉，公共关系，会议或研讨会。",
        love: "在公共场合遇到某人，社交关系，团体约会。",
        health: "团体治疗，新鲜空气，水疗，公共卫生。",
        person: "社交名流，公众人物，或热爱自然的人。"
      }
    }
  },
  { 
    id: 21, name: "The Mountain", nameCn: "山", keyword: "Obstacle, delay", icon: "Mountain", category: 'nature', polarity: 'negative', suit: 'clubs',
    meanings: {
      en: { 
        core: "Blocks, delays, challenges.", 
        extended: "Suggests a significant hurdle that requires patience and effort to overcome.",
        career: "A major obstacle at work, a project being put on hold, a difficult boss.",
        love: "A cold or blocked relationship, a long wait for love, emotional distance.",
        health: "Blockages, stiffness, head, bones.",
        person: "A stubborn, cold, or distant person; an outsider."
      },
      cn: { 
        core: "障碍，延迟，挑战。", 
        extended: "暗示一个重大的障碍，需要耐心和努力才能克服。",
        career: "工作中的重大障碍，项目被搁置，难对付的老板。",
        love: "冷淡或受阻的关系，对爱情的漫长等待，情感距离。",
        health: "阻塞，僵硬，头部，骨骼。",
        person: "固执、冷漠或疏远的人；局外人。"
      }
    }
  },
  { 
    id: 22, name: "The Crossroads", nameCn: "十字路口", keyword: "Choices, decisions", icon: "Split", category: 'objects', polarity: 'neutral', suit: 'diamonds',
    meanings: {
      en: { 
        core: "Decisions, paths, options.", 
        extended: "Indicates a turning point where you must choose between different directions.",
        career: "A career change, multiple job offers, a decision about your path.",
        love: "A choice between two people, a decision about a relationship.",
        health: "Veins, circulation, a decision about treatment.",
        person: "A person at a crossroads, someone indecisive or flexible."
      },
      cn: { 
        core: "选择，决定，路径。", 
        extended: "预示着一个转折点，你必须在不同的方向之间做出选择。",
        career: "职业转变，多个工作机会，关于职业道路的决定。",
        love: "在两个人之间做出选择，关于关系的决定。",
        health: "静脉，循环系统，关于治疗的决定。",
        person: "处于十字路口的人，犹豫不决或灵活的人。"
      }
    }
  },
  { 
    id: 23, name: "The Mice", nameCn: "老鼠", keyword: "Loss, stress", icon: "Bug", category: 'nature', polarity: 'negative', suit: 'clubs',
    meanings: {
      en: { 
        core: "Stress, erosion, small thefts.", 
        extended: "Warns of things being slowly eaten away, anxiety, and minor losses.",
        career: "Workplace stress, a project losing value, small financial losses.",
        love: "A relationship being eroded by stress, anxiety about love, a toxic connection.",
        health: "Stress-related illness, exhaustion, parasites.",
        person: "A stressed, anxious, or potentially dishonest person; a thief."
      },
      cn: { 
        core: "损失，压力，侵蚀。", 
        extended: "警告事物正在被慢慢蚕食、焦虑和微小的损失。",
        career: "职场压力，项目贬值，微小的财务损失。",
        love: "被压力侵蚀的关系，对爱情的焦虑，有毒的联系。",
        health: "与压力相关的疾病，精疲力竭，寄生虫。",
        person: "压力大、焦虑或可能不诚实的人；小偷。"
      }
    }
  },
  { 
    id: 24, name: "The Heart", nameCn: "心", keyword: "Love, affection", icon: "Heart", category: 'objects', polarity: 'positive', suit: 'hearts',
    meanings: {
      en: { 
        core: "Love, passion, romance.", 
        extended: "The primary card for emotions, romantic relationships, and heartfelt matters.",
        career: "A job you love, a passionate project, a supportive work environment.",
        love: "True love, a deep romantic connection, passion.",
        health: "Heart, blood, emotions affecting health.",
        person: "A loving, passionate, or romantic person; a lover."
      },
      cn: { 
        core: "爱，情感，浪漫。", 
        extended: "代表情感、浪漫关系和衷心事务的首要牌。",
        career: "你爱的工作，充满激情的项目，支持性的工作环境。",
        love: "真爱，深厚的情感联系，激情。",
        health: "心脏，血液，影响健康的情绪。",
        person: "充满爱心、激情或浪漫的人；恋人。"
      }
    }
  },
  { 
    id: 25, name: "The Ring", nameCn: "戒指", keyword: "Commitment, contract", icon: "CircleDot", category: 'objects', polarity: 'neutral', suit: 'clubs',
    meanings: {
      en: { 
        core: "Commitment, marriage, cycles.", 
        extended: "Relates to agreements, partnerships, and repetitive patterns.",
        career: "A contract, a business partnership, a long-term commitment.",
        love: "Marriage, engagement, a serious commitment, a cycle.",
        health: "Chronic conditions, repetitive issues, circulation.",
        person: "A committed, reliable, or married person."
      },
      cn: { 
        core: "承诺，契约，循环。", 
        extended: "涉及协议、伙伴关系和重复模式。",
        career: "合同，业务伙伴关系，长期承诺。",
        love: "婚姻，订婚，严肃的承诺，循环。",
        health: "慢性状况，重复性问题，循环系统。",
        person: "有承诺感、可靠或已婚的人。"
      }
    }
  },
  { 
    id: 26, name: "The Book", nameCn: "书", keyword: "Secrets, knowledge", icon: "Book", category: 'objects', polarity: 'neutral', suit: 'diamonds',
    meanings: {
      en: { 
        core: "Secrets, education, hidden info.", 
        extended: "Represents something yet to be revealed, studies, and expertise.",
        career: "Education, training, a secret project, specialized knowledge.",
        love: "A secret relationship, learning about a partner, hidden feelings.",
        health: "Brain, memory, hidden health issues, medical tests.",
        person: "A student, teacher, or someone secretive/knowledgeable."
      },
      cn: { 
        core: "秘密，知识，书籍。", 
        extended: "代表尚未揭晓的事物、学习和专业知识。",
        career: "教育，培训，秘密项目，专业知识。",
        love: "秘密关系，了解伴侣，隐藏的情感。",
        health: "大脑，记忆，隐藏的健康问题，医学测试。",
        person: "学生，老师，或神秘/博学的人。"
      }
    }
  },
  { 
    id: 27, name: "The Letter", nameCn: "信件", keyword: "Document, message", icon: "Mail", category: 'objects', polarity: 'neutral', suit: 'spades',
    meanings: {
      en: { 
        core: "Messages, paperwork, news.", 
        extended: "Relates to written communication, emails, and formal documents.",
        career: "An email, a contract, formal paperwork, a written offer.",
        love: "A love letter, a text message, formalizing a relationship.",
        health: "Prescriptions, test results, hands, skin.",
        person: "A writer, a communicator, or someone who sends a message."
      },
      cn: { 
        core: "信件，消息，文件。", 
        extended: "涉及书面交流、电子邮件和正式文件。",
        career: "电子邮件，合同，正式文书，书面录取通知。",
        love: "情书，短信，正式确立关系。",
        health: "处方，测试结果，手部，皮肤。",
        person: "作家，沟通者，或发送消息的人。"
      }
    }
  },
  { 
    id: 28, name: "The Man", nameCn: "男人", keyword: "Male energy", icon: "User", category: 'people', polarity: 'neutral', suit: 'hearts',
    meanings: {
      en: { 
        core: "The querent (if male) or a man.", 
        extended: "Represents a male person or masculine qualities in a situation.",
        career: "A male colleague, a masculine approach to work, taking action.",
        love: "A male partner, masculine energy in romance.",
        health: "Male reproductive system, physical strength.",
        person: "A man, the querent, or a masculine figure."
      },
      cn: { 
        core: "男人，男性能量。", 
        extended: "代表一个男性或局势中的男性特质。",
        career: "男性同事，工作中的男性化方式，采取行动。",
        love: "男性伴侣，浪漫中的男性能量。",
        health: "男性生殖系统，体力。",
        person: "男人，当事人，或男性形象。"
      }
    }
  },
  { 
    id: 29, name: "The Lady", nameCn: "女人", keyword: "Female energy", icon: "User", category: 'people', polarity: 'neutral', suit: 'spades',
    meanings: {
      en: { 
        core: "The querent (if female) or a woman.", 
        extended: "Represents a female person or feminine qualities in a situation.",
        career: "A female colleague, a feminine approach to work, intuition.",
        love: "A female partner, feminine energy in romance.",
        health: "Female reproductive system, hormonal balance.",
        person: "A woman, the querent, or a feminine figure."
      },
      cn: { 
        core: "女人，女性能量。", 
        extended: "代表一个女性或局势中的女性特质。",
        career: "女性同事，工作中的女性化方式，直觉。",
        love: "女性伴侣，浪漫中的女性能量。",
        health: "女性生殖系统，荷尔蒙平衡。",
        person: "女人，当事人，或女性形象。"
      }
    }
  },
  { 
    id: 30, name: "The Lily", nameCn: "百合", keyword: "Peace, maturity", icon: "Flower2", category: 'nature', polarity: 'neutral', suit: 'spades',
    meanings: {
      en: { 
        core: "Peace, wisdom, sexuality.", 
        extended: "Relates to older people, long-term harmony, and calm energy.",
        career: "A long-term career, retirement, a peaceful work environment.",
        love: "A mature relationship, sexual harmony, long-term peace.",
        health: "Eyes, aging, sexual health, calm mind.",
        person: "An older person, a wise mentor, or someone very calm."
      },
      cn: { 
        core: "和平，成熟，百合。", 
        extended: "涉及年长者、长期和谐和冷静的能量。",
        career: "长期的职业生涯，退休，和平的工作环境。",
        love: "成熟的关系，性和谐，长期的和平。",
        health: "眼睛，衰老，性健康，冷静的心态。",
        person: "年长者，睿智的导师，或非常冷静的人。"
      }
    }
  },
  { 
    id: 31, name: "The Sun", nameCn: "太阳", keyword: "Success, vitality", icon: "Sun", category: 'celestial', polarity: 'positive', suit: 'diamonds',
    meanings: {
      en: { 
        core: "Success, energy, warmth.", 
        extended: "A card of great happiness, victory, and positive outcomes.",
        career: "Great success, high energy, a leadership role, victory.",
        love: "A happy and successful relationship, warmth, vitality.",
        health: "High energy, vitality, heat, eyes.",
        person: "A successful, charismatic, or energetic person."
      },
      cn: { 
        core: "成功，生命力，太阳。", 
        extended: "一张代表巨大幸福、胜利和积极结果的牌。",
        career: "巨大的成功，高能量，领导角色，胜利。",
        love: "幸福而成功的关系，温暖，生命力。",
        health: "高能量，生命力，热量，眼睛。",
        person: "成功、有魅力或精力充沛的人。"
      }
    }
  },
  { 
    id: 32, name: "The Moon", nameCn: "月亮", keyword: "Intuition, emotions", icon: "Moon", category: 'celestial', polarity: 'neutral', suit: 'hearts',
    meanings: {
      en: { 
        core: "Emotions, intuition, fame.", 
        extended: "Relates to your subconscious, creativity, and public recognition.",
        career: "Recognition, fame, creative work, intuition at work.",
        love: "Deep emotions, romantic feelings, a soul connection.",
        health: "Hormones, cycles, emotional health.",
        person: "An intuitive, creative, or famous person."
      },
      cn: { 
        core: "直觉，情感，月亮。", 
        extended: "涉及你的潜意识、创造力和公众认可。",
        career: "认可，名声，创意工作，工作中的直觉。",
        love: "深层的情感，浪漫的感觉，灵魂的联系。",
        health: "荷尔蒙，周期，情感健康。",
        person: "直觉敏锐、有创意或著名的人。"
      }
    }
  },
  { 
    id: 33, name: "The Key", nameCn: "钥匙", keyword: "Solution, destiny", icon: "Key", category: 'objects', polarity: 'positive', suit: 'diamonds',
    meanings: {
      en: { 
        core: "Success, opening doors, certainty.", 
        extended: "Indicates that you have the answer or that something is inevitable.",
        career: "A key solution, a breakthrough, guaranteed success.",
        love: "A key relationship, finding the answer in love, certainty.",
        health: "A successful treatment, finding the cause of an illness.",
        person: "A problem-solver, a key person, or someone very certain."
      },
      cn: { 
        core: "关键，解决方案，命运。", 
        extended: "预示着你拥有答案，或者某事是不可避免的。",
        career: "关键解决方案，突破，保证成功。",
        love: "关键关系，在爱情中找到答案，确定性。",
        health: "成功的治疗，找到病因。",
        person: "问题解决者，关键人物，或非常确定的人。"
      }
    }
  },
  { 
    id: 34, name: "The Fish", nameCn: "鱼", keyword: "Abundance, flow", icon: "Fish", category: 'nature', polarity: 'positive', suit: 'diamonds',
    meanings: {
      en: { 
        core: "Money, flow, abundance.", 
        extended: "Relates to financial matters, business, and things moving freely.",
        career: "Financial abundance, a successful business, multiple income streams.",
        love: "A rich and abundant relationship, deep emotional flow.",
        health: "Kidneys, bladder, fertility, fluid balance.",
        person: "A wealthy, business-minded, or abundant person."
      },
      cn: { 
        core: "丰饶，流动，鱼。", 
        extended: "涉及财务事务、商业 and 自由流动的事物。",
        career: "财务丰饶，成功的商业，多种收入来源。",
        love: "丰富而充实的关系，深层的情感流动。",
        health: "肾脏，膀胱，生育能力，体液平衡。",
        person: "富有、有商业头脑或丰足的人。"
      }
    }
  },
  { 
    id: 35, name: "The Anchor", nameCn: "锚", keyword: "Stability, security", icon: "Anchor", category: 'objects', polarity: 'neutral', suit: 'spades',
    meanings: {
      en: { 
        core: "Stability, work, security.", 
        extended: "Represents long-term goals, safety, and being grounded.",
        career: "A stable job, a long-term position, security at work.",
        love: "A stable and secure relationship, long-term commitment.",
        health: "Hips, pelvis, being grounded, stable health.",
        person: "A stable, reliable, or grounded person."
      },
      cn: { 
        core: "稳定，安全，锚。", 
        extended: "代表长期目标、安全和脚踏实地。",
        career: "稳定的工作，长期职位，工作中的安全感。",
        love: "稳定且安全的关系，长期承诺。",
        health: "臀部，骨盆，脚踏实地，稳定的健康状况。",
        person: "稳定、可靠或脚踏实地的人。"
      }
    }
  },
  { 
    id: 36, name: "The Cross", nameCn: "十字架", keyword: "Burdens, faith", icon: "Plus", category: 'objects', polarity: 'negative', suit: 'clubs',
    meanings: {
      en: { 
        core: "Burdens, pain, destiny.", 
        extended: "Suggests a difficult period, spiritual lessons, and unavoidable challenges.",
        career: "A heavy workload, a difficult period at work, a karmic job.",
        love: "A burdened relationship, emotional pain, a difficult test in love.",
        health: "Back, spine, chronic pain, spiritual crisis.",
        person: "A burdened, serious, or spiritual person."
      },
      cn: { 
        core: "负担，信仰，十字架。", 
        extended: "暗示一段艰难的时期、精神教训和不可避免的挑战。",
        career: "沉重的工作量，工作中的艰难时期，业力工作。",
        love: "沉重的关系，情感痛苦，爱情中的艰难考验。",
        health: "背部，脊柱，慢性疼痛，精神危机。",
        person: "负担沉重、严肃或有精神追求的人。"
      }
    }
  },
];

/**
 * 定义单次占卜记录的接口，用于本地存储和历史展示
 */
export interface Reading {
  id: string;           // 唯一标识符 (通常使用时间戳)
  userId?: string;      // 用户 ID
  date: string;         // 格式化后的日期字符串
  cards: Card[];        // 抽取的卡牌数组
  interpretation: string; // AI 生成的解读摘要
  title: string;        // AI 生成的标题
  spreadType: number;   // 牌阵类型 (抽牌数量)
  reflection?: string;  // 用户填写的个人感悟 (可选)
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  phone?: string;
}

/**
 * 定义 AI 解读结果的 JSON Schema，用于约束 Gemini API 的输出格式
 */
export const INTERPRETATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A poetic title for the reading" },
    summary: { type: Type.STRING, description: "A few sentences summarizing the overall energy" },
    detailedAnalysis: { type: Type.STRING, description: "A deeper look at how the cards interact" },
    guidance: { type: Type.STRING, description: "A short, inspirational guidance quote" },
  },
  required: ["title", "summary", "detailedAnalysis", "guidance"],
};
