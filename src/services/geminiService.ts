// 导入 Google AI SDK，用于调用 Gemini 模型
import { GoogleGenAI } from "@google/genai";
// 导入卡牌类型定义和用于约束 AI 输出的 JSON Schema
import { Card, INTERPRETATION_SCHEMA } from "../types";

/**
 * Gemini AI 服务模块
 * 负责与 Google Gemini API 通信，将抽取的卡牌组合转化为文学性的占卜解读
 */
// 初始化 Gemini AI 实例，API Key 从环境变量中读取
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * 解读卡牌组合的核心函数
 * @param cards - 用户抽取的卡牌数组
 * @param language - 目标语言，支持 'en' (英文) 或 'cn' (中文)，默认为 'cn'
 * @returns 返回一个包含标题、总结、详细分析和指引的 JSON 对象
 */
export async function interpretReading(cards: Card[], language: 'en' | 'cn' = 'cn', question: string = "") {
  // 1. 准备卡牌信息：将卡牌名称和关键词拼接成字符串，作为 AI 的输入背景
  const cardNames = cards.map(c => `${c.name} (${c.keyword})`).join(", ");
  // 2. 确定提示词语言
  const langPrompt = language === 'en' ? 'English' : 'Chinese';
  
  // 3. 构建提示词 (Prompt)：明确告知 AI 它的角色、任务、输入内容以及输出要求
  const prompt = `Interpret this Lenormand card combination for a daily reading: ${cardNames}. 
  ${question ? `The user's specific question is: "${question}". Please tailor the interpretation to address this question directly.` : ""}
  Provide the response in ${langPrompt}.
  Provide a poetic title, a summary of the energy, a detailed analysis of the interaction between cards, and a short guidance quote.
  The interpretation should be mystic, insightful, and encouraging.`;

  try {
    // 4. 调用 Gemini 3 Flash 模型生成内容
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // 使用高性能、低延迟的 Flash 模型
      contents: prompt,
      config: {
        responseMimeType: "application/json", // 强制要求返回 JSON 格式
        responseSchema: INTERPRETATION_SCHEMA, // 使用预定义的 Schema 确保 JSON 结构符合前端要求
      },
    });

    // 5. 获取并清理返回的文本内容
    const text = response.text || "{}";
    // 如果 AI 错误地返回了 Markdown 代码块（如 ```json ... ```），则将其剔除
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    // 6. 解析 JSON 并返回
    return JSON.parse(cleanJson);
  } catch (error) {
    // 7. 异常处理：如果 API 调用失败（如网络问题或 Key 失效），返回预定义的默认解读，确保应用不崩溃
    console.error("AI Interpretation failed:", error);
    // 根据语言返回对应的回退内容
    if (language === 'cn') {
      return {
        title: "静默之路",
        summary: "今天的牌面笼罩在神秘之中。",
        detailedAnalysis: "有时宇宙要求的是耐心而非答案。在这一天中，请反思你自己的直觉。",
        guidance: "相信你生命中看不见的暗流。"
      };
    }
    return {
      title: "The Silent Path",
      summary: "The cards remain veiled in mystery today.",
      detailedAnalysis: "Sometimes the universe asks for patience rather than answers. Reflect on your own intuition as you move through the day.",
      guidance: "Trust the unseen currents of your life."
    };
  }
}
