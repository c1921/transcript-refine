import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, TranscriptRefineSettingTab } from './settings';
import { TranscriptRefineSettings } from './types';
import { registerCommands } from './commands';
import { registerEditorMenu } from './ui';

export default class TranscriptRefinePlugin extends Plugin {
	settings!: TranscriptRefineSettings;
	isRefining = false;
	private statusBarEl!: HTMLElement;

	async onload() {
		await this.loadSettings();

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
		this.statusBarEl.setText(refining ? '🤖 整理中...' : '');
	}
}
