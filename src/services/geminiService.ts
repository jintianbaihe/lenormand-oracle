import { GoogleGenAI } from "@google/genai";
import { Card, INTERPRETATION_SCHEMA } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// 各语言的回退解读内容，统一定义，避免在 ReadingResult 页面重复硬编码
export const FALLBACK_INTERPRETATION = {
  cn: {
    title: "静默之路",
    summary: "今天的牌面笼罩在神秘之中。",
    detailedAnalysis: "有时宇宙要求的是耐心而非答案。在这一天中，请反思你自己的直觉。",
    guidance: "相信你生命中看不见的暗流。",
  },
  en: {
    title: "The Silent Path",
    summary: "The cards remain veiled in mystery today.",
    detailedAnalysis: "Sometimes the universe asks for patience rather than answers. Reflect on your own intuition as you move through the day.",
    guidance: "Trust the unseen currents of your life.",
  },
};

/**
 * 调用 Gemini AI 解读卡牌组合
 * @param cards 用户抽取的卡牌数组
 * @param language 目标语言，默认中文
 * @param question 用户提出的问题（可选）
 */
export async function interpretReading(cards: Card[], language: 'en' | 'cn' = 'cn', question = "") {
  const cardNames = cards.map(c => `${c.name} (${c.keyword})`).join(", ");
  const langPrompt = language === 'en' ? 'English' : 'Chinese';
  const questionPart = question
    ? `The user's specific question is: "${question}". Please tailor the interpretation to address this question directly.`
    : "";

  const prompt = `Interpret this Lenormand card combination for a daily reading: ${cardNames}. 
  ${questionPart}
  Provide the response in ${langPrompt}.
  Provide a poetic title, a summary of the energy, a detailed analysis of the interaction between cards, and a short guidance quote.
  The interpretation should be mystic, insightful, and encouraging.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: INTERPRETATION_SCHEMA,
      },
    });

    const text = response.text || "{}";
    // 兜底：移除 AI 可能错误返回的 Markdown 代码块标记
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Interpretation failed:", error);
    return FALLBACK_INTERPRETATION[language];
  }
}
