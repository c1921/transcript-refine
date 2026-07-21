import { Editor, MarkdownView, MarkdownFileInfo } from 'obsidian';
import TranscriptRefinePlugin from '../main';
import { refineSelection, refineWholeDocument } from './refine';

export function registerCommands(plugin: TranscriptRefinePlugin): void {
	// 选中整理 —— 仅在编辑器有选中文字时可用
	plugin.addCommand({
		id: 'refine-selection',
		name: 'AI 整理选中文字',
		editorCheckCallback: (
			checking: boolean,
			editor: Editor,
			_ctx: MarkdownView | MarkdownFileInfo,
		): boolean => {
			const hasSelection = !!editor.getSelection().trim();
			if (checking) {
				return hasSelection && !plugin.isRefining;
			}
			if (!hasSelection) {
				return false;
			}
			void refineSelection(plugin, editor);
			return true;
		},
	});

	// 整篇整理 —— 始终可用
	plugin.addCommand({
		id: 'refine-whole-doc',
		name: 'AI 整理整篇文档',
		editorCheckCallback: (
			checking: boolean,
			editor: Editor,
			_ctx: MarkdownView | MarkdownFileInfo,
		): boolean => {
			if (checking) {
				return !plugin.isRefining;
			}
			void refineWholeDocument(plugin, editor);
			return true;
		},
	});
}
