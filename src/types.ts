/**
 * 整理模板 —— 用户可使用的 prompt 模板
 */
export interface PromptTemplate {
	/** 唯一标识，预设模板使用固定 id，自定义模板使用 uuid */
	id: string;
	/** 模板显示名称 */
	name: string;
	/** 一句话描述模板适用场景 */
	description: string;
	/** 发送给 AI 的 system prompt */
	prompt: string;
	/** 是否为预设模板（预设不可删除，可恢复默认） */
	isPreset: boolean;
}

/**
 * 插件全局设置
 */
export interface TranscriptRefineSettings {
	apiUrl: string;
	/** SecretStorage 中密钥的 ID，由 SecretComponent 选择 */
	apiKey: string;
	model: string;
	defaultTemplateId: string;
	templates: PromptTemplate[];
	timeout: number;
	maxTokens: number;
}
