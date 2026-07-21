import { Editor, Menu, MenuItem } from 'obsidian';
import TranscriptRefinePlugin from '../main';
import { refineSelection } from '../commands/refine';
import { t, format } from '../i18n';

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
				? format(t().menu.aiRefineWith, { name: defaultTemplate.name })
				: t().menu.aiRefine;

			menu.addItem((item: MenuItem) => {
				item
					.setTitle(defaultName)
					.setIcon('pencil')
					.onClick(() => {
						void refineSelection(plugin, editor);
					});
			});

			menu.addItem((item: MenuItem) => {
				item.setTitle(t().menu.aiRefineAs).setIcon('pencil');

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
