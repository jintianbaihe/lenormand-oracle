import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 辅助函数：合并 Tailwind CSS 类名
 * 使用 clsx 处理条件类名，使用 twMerge 解决 Tailwind 类冲突（如 padding 覆盖）
 * @param inputs - 各种形式的类名输入
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
