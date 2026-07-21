import { Editor, Menu, MenuItem } from 'obsidian';
import TranscriptRefinePlugin from '../main';
import { refineSelection } from '../commands/refine';

/** Narrow interface to access workspace.on without overload resolution issues */
interface EditorMenuAccess {
	on(
		name: string,
		callback: (menu: Menu, editor: Editor, view: unknown) => void,
	): { e: unknown };
}

export function registerEditorMenu(plugin: TranscriptRefinePlugin): void {
	const ws = plugin.app.workspace as unknown as EditorMenuAccess;

	plugin.registerEvent(
		ws.on('editor-menu', (menu: Menu, editor: Editor, _view: unknown) => {
			const selection = editor.getSelection();
			if (!selection || selection.trim().length === 0) {
				return;
			}

			const templates = plugin.settings.templates;
			const defaultTemplate = templates.find(
				(t) => t.id === plugin.settings.defaultTemplateId,
			);
			const defaultName = defaultTemplate
				? `AI 整理（${defaultTemplate.name}）`
				: 'AI 整理';

			menu.addItem((item: MenuItem) => {
				item
					.setTitle(defaultName)
					.setIcon('pencil')
					.onClick(() => {
						void refineSelection(plugin, editor);
					});
			});

			menu.addItem((item: MenuItem) => {
				item.setTitle('AI 整理为 →').setIcon('pencil');

				// setSubmenu exists at runtime but may be missing from typings
				interface HasSetSubmenu {
					setSubmenu(): Menu;
				}
				const subMenu = (
					item as unknown as HasSetSubmenu
				).setSubmenu();

				for (const template of templates) {
					subMenu.addItem((subItem: MenuItem) => {
						subItem
							.setTitle(template.name)
							.onClick(() => {
								void refineSelection(
									plugin,
									editor,
									template.id,
								);
							});
					});
				}
			});

			menu.addSeparator();
		}),
	);
}
