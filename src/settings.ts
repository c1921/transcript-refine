import { App, PluginSettingTab, Setting, Modal, Notice, SecretComponent, getLanguage } from 'obsidian';
import TranscriptRefinePlugin from './main';
import { TranscriptRefineSettings, PromptTemplate } from './types';
import { getPresetDefaults } from './utils/templates';
import { t } from './i18n';

export const DEFAULT_SETTINGS: TranscriptRefineSettings = {
	apiUrl: 'https://api.deepseek.com',
	apiKey: '',
	model: 'deepseek-v4-flash',
	defaultTemplateId: 'general',
	templates: [],
	timeout: 30000,
	maxTokens: 4096,
};

export class TranscriptRefineSettingTab extends PluginSettingTab {
	plugin: TranscriptRefinePlugin;

	constructor(app: App, plugin: TranscriptRefinePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// ── API 配置 ──
		new Setting(containerEl).setName(t().settings.heading.api).setHeading();

		new Setting(containerEl)
			.setName(t().settings.apiUrl.name)
			.setDesc(t().settings.apiUrl.desc)
			.addText((text) =>
				text
					.setPlaceholder('https://api.deepseek.com')
					.setValue(this.plugin.settings.apiUrl)
					.onChange(async (value) => {
						this.plugin.settings.apiUrl = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t().settings.apiKey.name)
			.setDesc(t().settings.apiKey.desc)
			.addComponent((el) => new SecretComponent(this.app, el)
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(t().settings.model.name)
			.setDesc(t().settings.model.desc)
			.addText((text) =>
				text
					.setPlaceholder('deepseek-v4-flash')
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					}),
			);

		// ── 整理行为 ──
		new Setting(containerEl).setName(t().settings.heading.behavior).setHeading();

		const templateOptions: Record<string, string> = {};
		for (const t of this.plugin.settings.templates) {
			templateOptions[t.id] = t.name;
		}

		new Setting(containerEl)
			.setName(t().settings.defaultTemplate.name)
			.setDesc(t().settings.defaultTemplate.desc)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(templateOptions)
					.setValue(this.plugin.settings.defaultTemplateId)
					.onChange(async (value) => {
						this.plugin.settings.defaultTemplateId = value;
						await this.plugin.saveSettings();
					}),
			);

		// ── Prompt 模板管理 ──
		new Setting(containerEl).setName(t().settings.heading.templates).setHeading();

		this.renderTemplateList(containerEl);

		new Setting(containerEl)
			.setName(t().settings.newTemplate.name)
			.setDesc(t().settings.newTemplate.desc)
			.addButton((btn) =>
				btn
					.setButtonText(t().settings.newTemplate.button)
					.setCta()
					.onClick(() => {
						this.openTemplateEditor(null);
					}),
			);

		// ── 高级 ──
		new Setting(containerEl).setName(t().settings.heading.advanced).setHeading();

		new Setting(containerEl)
			.setName(t().settings.timeout.name)
			.setDesc(t().settings.timeout.desc)
			.addText((text) =>
				text
					.setPlaceholder('30000')
					.setValue(String(this.plugin.settings.timeout))
					.onChange(async (value) => {
						const n = parseInt(value, 10);
						if (!isNaN(n) && n > 0) {
							this.plugin.settings.timeout = n;
							await this.plugin.saveSettings();
						}
					}),
			);

		new Setting(containerEl)
			.setName(t().settings.maxTokens.name)
			.setDesc(t().settings.maxTokens.desc)
			.addText((text) =>
				text
					.setPlaceholder('4096')
					.setValue(String(this.plugin.settings.maxTokens))
					.onChange(async (value) => {
						const n = parseInt(value, 10);
						if (!isNaN(n) && n > 0) {
							this.plugin.settings.maxTokens = n;
							await this.plugin.saveSettings();
						}
					}),
			);
	}

	/** 渲染模板列表 */
	private renderTemplateList(container: HTMLElement): void {
		for (const template of this.plugin.settings.templates) {
			const suffix = template.isPreset
				? t().settings.templateList.presetSuffix
				: t().settings.templateList.customSuffix;
			const setting = new Setting(container)
				.setName(template.name)
				.setDesc(template.description + suffix);

			setting.addButton((btn) =>
				btn.setButtonText(t().settings.templateList.edit).onClick(() => {
					this.openTemplateEditor(template);
				}),
			);

			if (template.isPreset) {
				setting.addButton((btn) =>
					btn.setButtonText(t().settings.templateList.reset).onClick(async () => {
						const defaults = getPresetDefaults(getLanguage());
						const def = defaults.find((d) => d.id === template.id);
						if (def) {
							Object.assign(template, def);
							await this.plugin.saveSettings();
							this.display();
						}
					}),
				);
			} else {
				setting.addButton((btn) =>
					btn.setButtonText(t().settings.templateList.delete).setWarning().onClick(async () => {
						this.plugin.settings.templates =
							this.plugin.settings.templates.filter(
								(t) => t.id !== template.id,
							);
						await this.plugin.saveSettings();
						this.display();
					}),
				);
			}
		}
	}

	/** 打开模板编辑 Modal */
	private openTemplateEditor(template: PromptTemplate | null): void {
		const isNew = template === null;
		const working: PromptTemplate = template
			? { ...template }
			: {
					id: crypto.randomUUID(),
					name: '',
					description: '',
					prompt: '',
					isPreset: false,
			  };

		new TemplateEditorModal(this.plugin.app, working, async (result) => {
			if (!result) return;

			if (isNew) {
				this.plugin.settings.templates.push(result);
			} else {
				const idx = this.plugin.settings.templates.findIndex(
					(t) => t.id === result.id,
				);
				if (idx !== -1) {
					this.plugin.settings.templates[idx] = result;
				}
			}

			await this.plugin.saveSettings();
			this.display();
		}).open();
	}
}

/** 模板编辑弹窗 */
class TemplateEditorModal extends Modal {
	private template: PromptTemplate;
	private onSubmit: (result: PromptTemplate | null) => void | Promise<void>;

	constructor(
			app: App,
			template: PromptTemplate,
			onSubmit: (result: PromptTemplate | null) => void | Promise<void>,
	) {
		super(app);
		this.template = template;
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h3', {
			text: this.template.isPreset
				? t().settings.templateEditor.titleEdit
				: t().settings.templateEditor.titleNew,
		});

		new Setting(contentEl)
			.setName(t().settings.templateEditor.name)
			.addText((text) => {
				text.setValue(this.template.name).onChange((v) => {
					this.template.name = v;
				});
			});

		new Setting(contentEl)
			.setName(t().settings.templateEditor.desc)
			.setDesc(t().settings.templateEditor.descPlaceholder)
			.addText((text) => {
				text.setValue(this.template.description).onChange((v) => {
					this.template.description = v;
				});
			});

		new Setting(contentEl)
			.setName(t().settings.templateEditor.systemPrompt)
			.setDesc(t().settings.templateEditor.systemPromptDesc)
			.addTextArea((text) => {
				text
					.setValue(this.template.prompt)
					.onChange((v) => {
						this.template.prompt = v;
					});
				text.inputEl.rows = 12;
			});

		new Setting(contentEl)
			.addButton((btn) =>
				btn.setButtonText(t().settings.templateEditor.cancel).onClick(() => {
					void this.onSubmit(null);
					this.close();
				}),
			)
			.addButton((btn) =>
				btn
					.setButtonText(t().settings.templateEditor.save)
					.setCta()
					.onClick(() => {
						if (!this.template.name.trim()) {
							new Notice(t().settings.templateEditor.nameRequired);
							return;
						}
						if (!this.template.prompt.trim()) {
							new Notice(t().settings.templateEditor.promptRequired);
							return;
						}
						void this.onSubmit(this.template);
						this.close();
					}),
			);
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
