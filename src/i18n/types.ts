/**
 * 翻译接口 —— 所有语言包必须实现此接口
 * 添加新的翻译键时，zh.ts 和 en.ts 都需要同步更新
 */
export interface Translation {
	settings: {
		heading: {
			api: string;
			behavior: string;
			templates: string;
			advanced: string;
		};
		apiUrl: { name: string; desc: string };
		apiKey: { name: string; desc: string };
		model: { name: string; desc: string };
		defaultTemplate: { name: string; desc: string };
		newTemplate: { name: string; desc: string; button: string };
		timeout: { name: string; desc: string };
		maxTokens: { name: string; desc: string };
		templateList: {
			edit: string;
			reset: string;
			delete: string;
			presetSuffix: string;
			customSuffix: string;
		};
		templateEditor: {
			titleEdit: string;
			titleNew: string;
			name: string;
			desc: string;
			descPlaceholder: string;
			systemPrompt: string;
			systemPromptDesc: string;
			cancel: string;
			save: string;
			nameRequired: string;
			promptRequired: string;
		};
	};
	commands: {
		refineSelection: string;
		refineWholeDoc: string;
	};
	notices: {
		noSelection: string;
		configureApiKey: string;
		noTemplate: string;
		refineComplete: string;
		refineFailed: string;
		docEmpty: string;
		wholeDocComplete: string;
	};
	menu: {
		aiRefine: string;
		aiRefineAs: string;
		/** 格式：AI Refine ({name}) */
		aiRefineWith: string;
	};
	statusBar: {
		refining: string;
	};
	api: {
		timeout: string;
		networkError: string;
		requestFailed: string;
		invalidKey: string;
		rateLimited: string;
		noContent: string;
		apiReturnedError: string;
	};
	chunk: {
		/** 格式：Note: this is part {current}/{total}… */
		note: string;
	};
}
