import { Translation } from './types';

/**
 * 中文语言包
 */
export const zh: Translation = {
	settings: {
		heading: {
			api: 'API 配置',
			behavior: '整理行为',
			templates: 'Prompt 模板管理',
			advanced: '高级',
		},
		apiUrl: {
			name: 'API 地址',
			desc: 'DeepSeek 兼容的 API 端点地址',
		},
		apiKey: {
			name: 'API Key',
			desc: '从系统密钥库选择或新建 API 密钥',
		},
		model: {
			name: '模型',
			desc: '使用的模型名称，如 deepseek-v4-flash、deepseek-v4-pro 等',
		},
		defaultTemplate: {
			name: '默认模板',
			desc: '快速整理时默认使用的模板',
		},
		newTemplate: {
			name: '新增模板',
			desc: '创建一个自定义整理模板',
			button: '+ 新增',
		},
		timeout: {
			name: '请求超时（毫秒）',
			desc: 'API 请求的超时时间，默认 30000',
		},
		maxTokens: {
			name: '最大 Token 数',
			desc: 'AI 每次输出的最大 token 数，默认 4096',
		},
		templateList: {
			edit: '编辑',
			reset: '恢复默认',
			delete: '删除',
			presetSuffix: '（预设）',
			customSuffix: '（自定义）',
		},
		templateEditor: {
			titleEdit: '编辑预设模板',
			titleNew: '编辑模板',
			name: '模板名称',
			desc: '描述',
			descPlaceholder: '一两句话说明适用场景',
			systemPrompt: 'System Prompt',
			systemPromptDesc: '发送给 AI 的系统指令',
			cancel: '取消',
			save: '保存',
			nameRequired: '模板名称不能为空',
			promptRequired: 'System Prompt 不能为空',
		},
	},
	commands: {
		refineSelection: 'AI 整理选中文字',
		refineWholeDoc: 'AI 整理整篇文档',
	},
	notices: {
		noSelection: '未选中有效文字',
		configureApiKey: '请先在设置中配置 API Key',
		noTemplate: '未找到可用模板',
		refineComplete: '整理完成',
		refineFailed: '整理失败',
		docEmpty: '文档为空',
		wholeDocComplete: '整篇整理完成',
	},
	menu: {
		aiRefine: 'AI 整理',
		aiRefineAs: 'AI 整理为 →',
		aiRefineWith: 'AI 整理（{name}）',
	},
	statusBar: {
		refining: '🤖 整理中...',
	},
	api: {
		timeout: '请求超时，请检查网络或增加超时设置',
		networkError: '网络错误，无法连接到 API 服务器',
		requestFailed: 'API 请求失败：{message}',
		invalidKey: 'API Key 无效，请在设置中检查',
		rateLimited: 'API 请求频率过高，请稍后再试',
		noContent: 'AI 未返回有效内容，请重试',
		apiReturnedError: 'API 返回错误 ({status})',
	},
	chunk: {
		note: '注意：这是长文档的第 {current}/{total} 部分，请保持与前文风格一致。',
	},
};
