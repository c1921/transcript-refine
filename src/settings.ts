import { App, PluginSettingTab, Setting, Modal, Notice, SecretComponent } from 'obsidian';
import TranscriptRefinePlugin from './main';
import { TranscriptRefineSettings, PromptTemplate } from './types';
import { getPresetDefaults } from './utils/templates';

export const DEFAULT_SETTINGS: TranscriptRefineSettings = {
	apiUrl: 'https://api.deepseek.com',
	apiKey: '',
	model: 'deepseek-v4-flash',
	defaultTemplateId: 'general',
	templates: getPresetDefaults(),
	timeout: 30000,
	maxTokens: 4096,
};

export class TranscriptRefineSettingTab extends PluginSettingTab {
	plugin: TranscriptRefinePlugin;

	constructor(app: App, plugin: TranscriptRefinePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions() {
		return [];
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// ── API 配置 ──
		new Setting(containerEl).setName('API 配置').setHeading();

		new Setting(containerEl)
			.setName('API 地址')
			.setDesc('DeepSeek 兼容的 API 端点地址')
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
			.setName('API Key')
			.setDesc('从系统密钥库选择或新建 API 密钥')
			.addComponent((el) => new SecretComponent(this.app, el)
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('模型')
			.setDesc('使用的模型名称，如 deepseek-v4-flash、deepseek-v4-pro 等')
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
		new Setting(containerEl).setName('整理行为').setHeading();

		const templateOptions: Record<string, string> = {};
		for (const t of this.plugin.settings.templates) {
			templateOptions[t.id] = t.name;
		}

		new Setting(containerEl)
			.setName('默认模板')
			.setDesc('快速整理时默认使用的模板')
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
		new Setting(containerEl).setName('Prompt 模板管理').setHeading();

		this.renderTemplateList(containerEl);

		new Setting(containerEl)
			.setName('新增模板')
			.setDesc('创建一个自定义整理模板')
			.addButton((btn) =>
				btn
					.setButtonText('+ 新增')
					.setCta()
					.onClick(() => {
						this.openTemplateEditor(null);
					}),
			);

		// ── 高级 ──
		new Setting(containerEl).setName('高级').setHeading();

		new Setting(containerEl)
			.setName('请求超时（毫秒）')
			.setDesc('API 请求的超时时间，默认 30000')
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
			.setName('最大 Token 数')
			.setDesc('AI 每次输出的最大 token 数，默认 4096')
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
			const setting = new Setting(container)
				.setName(template.name)
				.setDesc(template.description + (template.isPreset ? '（预设）' : '（自定义）'));

			setting.addButton((btn) =>
				btn.setButtonText('编辑').onClick(() => {
					this.openTemplateEditor(template);
				}),
			);

			if (template.isPreset) {
				setting.addButton((btn) =>
					btn.setButtonText('恢复默认').onClick(async () => {
						const defaults = getPresetDefaults();
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
					btn.setButtonText('删除').setWarning().onClick(async () => {
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
			text: this.template.isPreset ? '编辑预设模板' : '编辑模板',
		});

		new Setting(contentEl)
			.setName('模板名称')
			.addText((text) => {
				text.setValue(this.template.name).onChange((v) => {
					this.template.name = v;
				});
			});

		new Setting(contentEl)
			.setName('描述')
			.setDesc('一两句话说明适用场景')
			.addText((text) => {
				text.setValue(this.template.description).onChange((v) => {
					this.template.description = v;
				});
			});

		new Setting(contentEl)
			.setName('System Prompt')
			.setDesc('发送给 AI 的系统指令')
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
				btn.setButtonText('取消').onClick(() => {
					void this.onSubmit(null);
					this.close();
				}),
			)
			.addButton((btn) =>
				btn
					.setButtonText('保存')
					.setCta()
					.onClick(() => {
						if (!this.template.name.trim()) {
							new Notice('模板名称不能为空');
							return;
						}
						if (!this.template.prompt.trim()) {
							new Notice('System Prompt 不能为空');
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
