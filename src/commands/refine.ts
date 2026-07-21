import { Editor, Notice } from 'obsidian';
import TranscriptRefinePlugin from '../main';
import { callAI, callAIWithChunking } from '../api';
import { t } from '../i18n';

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
		new Notice(t().notices.noSelection);
		return;
	}

	const apiKey = resolveApiKey(plugin);
	if (!apiKey) {
		new Notice(t().notices.configureApiKey);
		return;
	}

	const template = templateId
		? plugin.settings.templates.find((t) => t.id === templateId)
		: getActiveTemplate(plugin);

	if (!template) {
		new Notice(t().notices.noTemplate);
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
		new Notice(t().notices.refineComplete);
	} catch (err) {
		const message = err instanceof Error ? err.message : t().notices.refineFailed;
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
		new Notice(t().notices.docEmpty);
		return;
	}

	const apiKey = resolveApiKey(plugin);
	if (!apiKey) {
		new Notice(t().notices.configureApiKey);
		return;
	}

	const template = templateId
		? plugin.settings.templates.find((t) => t.id === templateId)
		: getActiveTemplate(plugin);

	if (!template) {
		new Notice(t().notices.noTemplate);
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
		new Notice(t().notices.wholeDocComplete);
	} catch (err) {
		const message = err instanceof Error ? err.message : t().notices.refineFailed;
		new Notice(message);
	} finally {
		plugin.setRefining(false);
	}
}
