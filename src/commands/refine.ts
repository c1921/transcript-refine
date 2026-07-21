import { Editor, Notice } from 'obsidian';
import TranscriptRefinePlugin from '../main';
import { callAI, callAIWithChunking } from '../api';

/**
 * 获取当前使用的模板
 */
function getActiveTemplate(plugin: TranscriptRefinePlugin) {
	const { templates, defaultTemplateId } = plugin.settings;
	return templates.find((t) => t.id === defaultTemplateId) ?? templates[0];
}

/**
 * 从 SecretStorage 中获取实际 API Key
 */
function resolveApiKey(plugin: TranscriptRefinePlugin): string | null {
	const secretId = plugin.settings.apiKey;
	if (!secretId) return null;
	return plugin.app.secretStorage.getSecret(secretId);
}

/**
 * 整理选中文字 —— 原地替换
 */
export async function refineSelection(
	plugin: TranscriptRefinePlugin,
	editor: Editor,
	templateId?: string,
): Promise<void> {
	const selection = editor.getSelection();

	if (!selection || selection.trim().length === 0) {
		new Notice('未选中有效文字');
		return;
	}

	const apiKey = resolveApiKey(plugin);
	if (!apiKey) {
		new Notice('请先在设置中配置 API Key');
		return;
	}

	const template = templateId
		? plugin.settings.templates.find((t) => t.id === templateId)
		: getActiveTemplate(plugin);

	if (!template) {
		new Notice('未找到可用模板');
		return;
	}

	plugin.setRefining(true);

	try {
		const result = await callAI(
			selection,
			template.prompt,
			plugin.settings,
			apiKey,
		);
		editor.replaceSelection(result);
		new Notice('整理完成');
	} catch (err) {
		const message = err instanceof Error ? err.message : '整理失败';
		new Notice(message);
	} finally {
		plugin.setRefining(false);
	}
}

/**
 * 整理整篇文档
 */
export async function refineWholeDocument(
	plugin: TranscriptRefinePlugin,
	editor: Editor,
	templateId?: string,
): Promise<void> {
	const content = editor.getValue();

	if (!content || content.trim().length === 0) {
		new Notice('文档为空');
		return;
	}

	const apiKey = resolveApiKey(plugin);
	if (!apiKey) {
		new Notice('请先在设置中配置 API Key');
		return;
	}

	const template = templateId
		? plugin.settings.templates.find((t) => t.id === templateId)
		: getActiveTemplate(plugin);

	if (!template) {
		new Notice('未找到可用模板');
		return;
	}

	plugin.setRefining(true);

	try {
		const result = await callAIWithChunking(
			content,
			template.prompt,
			plugin.settings,
			apiKey,
		);
		editor.setValue(result);
		new Notice('整篇整理完成');
	} catch (err) {
		const message = err instanceof Error ? err.message : '整理失败';
		new Notice(message);
	} finally {
		plugin.setRefining(false);
	}
}
