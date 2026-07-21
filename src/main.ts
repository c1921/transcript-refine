import { Plugin } from 'obsidian';
import { getLanguage } from 'obsidian';
import { initI18n, t } from './i18n';
import { DEFAULT_SETTINGS, TranscriptRefineSettingTab } from './settings';
import { TranscriptRefineSettings } from './types';
import { getPresetDefaults } from './utils/templates';
import { registerCommands } from './commands';
import { registerEditorMenu } from './ui';

export default class TranscriptRefinePlugin extends Plugin {
	settings!: TranscriptRefineSettings;
	isRefining = false;
	private statusBarEl!: HTMLElement;

	async onload() {
		await this.loadSettings();

		// 初始化多语言（根据 Obsidian 界面语言自动切换）
		initI18n(getLanguage());

		// 首次安装或模板为空时，根据当前语言初始化预设模板
		if (this.settings.templates.length === 0) {
			this.settings.templates = getPresetDefaults(getLanguage());
			this.settings.defaultTemplateId = 'general';
			await this.saveSettings();
		}

		this.addSettingTab(new TranscriptRefineSettingTab(this.app, this));

		registerCommands(this);
		registerEditorMenu(this);

		// 状态栏显示
		this.statusBarEl = this.addStatusBarItem();
		this.statusBarEl.setText('');
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<TranscriptRefineSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/** 设置整理中状态，更新状态栏 */
	setRefining(refining: boolean): void {
		this.isRefining = refining;
		this.statusBarEl.setText(refining ? t().statusBar.refining : '');
	}
}
