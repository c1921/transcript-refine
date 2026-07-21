import { Translation } from './types';

/**
 * 英文语言包
 */
export const en: Translation = {
	settings: {
		heading: {
			api: 'API Configuration',
			behavior: 'Refine Behavior',
			templates: 'Prompt Template Management',
			advanced: 'Advanced',
		},
		apiUrl: {
			name: 'API URL',
			desc: 'DeepSeek-compatible API endpoint URL',
		},
		apiKey: {
			name: 'API Key',
			desc: 'Select or create an API key from the system keystore',
		},
		model: {
			name: 'Model',
			desc: 'Model name, e.g. deepseek-v4-flash, deepseek-v4-pro',
		},
		defaultTemplate: {
			name: 'Default Template',
			desc: 'Template used for quick refine',
		},
		newTemplate: {
			name: 'New Template',
			desc: 'Create a custom refine template',
			button: '+ New',
		},
		timeout: {
			name: 'Request Timeout (ms)',
			desc: 'API request timeout in milliseconds, default 30000',
		},
		maxTokens: {
			name: 'Max Tokens',
			desc: 'Maximum tokens per AI response, default 4096',
		},
		templateList: {
			edit: 'Edit',
			reset: 'Reset',
			delete: 'Delete',
			presetSuffix: ' (Preset)',
			customSuffix: ' (Custom)',
		},
		templateEditor: {
			titleEdit: 'Edit Preset Template',
			titleNew: 'Edit Template',
			name: 'Template Name',
			desc: 'Description',
			descPlaceholder: 'Briefly describe the use case',
			systemPrompt: 'System Prompt',
			systemPromptDesc: 'System instruction sent to the AI',
			cancel: 'Cancel',
			save: 'Save',
			nameRequired: 'Template name cannot be empty',
			promptRequired: 'System Prompt cannot be empty',
		},
	},
	commands: {
		refineSelection: 'AI Refine Selection',
		refineWholeDoc: 'AI Refine Whole Document',
	},
	notices: {
		noSelection: 'No text selected',
		configureApiKey: 'Please configure an API Key in settings first',
		noTemplate: 'No template found',
		refineComplete: 'Refinement complete',
		refineFailed: 'Refinement failed',
		docEmpty: 'Document is empty',
		wholeDocComplete: 'Whole document refinement complete',
	},
	menu: {
		aiRefine: 'AI Refine',
		aiRefineAs: 'AI Refine as →',
		aiRefineWith: 'AI Refine ({name})',
	},
	statusBar: {
		refining: '🤖 Refining...',
	},
	api: {
		timeout: 'Request timed out. Check your network or increase the timeout setting',
		networkError: 'Network error: unable to reach the API server',
		requestFailed: 'API request failed: {message}',
		invalidKey: 'Invalid API Key. Please check it in settings',
		rateLimited: 'API rate limit exceeded. Please try again later',
		noContent: 'AI returned no content. Please try again',
		apiReturnedError: 'API returned error ({status})',
	},
	chunk: {
		note: 'Note: this is part {current}/{total} of a long document. Please maintain consistency with the previous style.',
	},
};
