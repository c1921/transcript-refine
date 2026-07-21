import { Translation } from './types';
import { zh } from './zh';
import { en } from './en';

let translations: Translation = zh;

/**
 * 根据 Obsidian 界面语言代码初始化翻译
 * @param lang Obsidian 的 getLanguage() 返回值，如 'zh', 'en', 'zh-TW'
 */
export function initI18n(lang: string): void {
	if (lang.startsWith('zh')) {
		translations = zh;
	} else {
		translations = en;
	}
}

/**
 * 获取当前语言的翻译对象
 */
export function t(): Translation {
	return translations;
}

/**
 * 格式化带占位符的字符串
 * 占位符格式：{key}
 * @example
 *   format('Hello {name}', { name: 'World' }) // => 'Hello World'
 */
export function format(tpl: string, args: Record<string, string | number>): string {
	return tpl.replace(/\{(\w+)\}/g, (_, key: string) =>
		args[key] !== undefined ? String(args[key]) : `{${key}}`,
	);
}
