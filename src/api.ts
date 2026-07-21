import { requestUrl, RequestUrlResponse } from 'obsidian';
import { TranscriptRefineSettings } from './types';

/**
 * 调用 AI API 进行文字整理
 * @param content 需要整理的原始文字
 * @param systemPrompt 系统提示词（来自模板）
 * @param settings 插件设置
 * @returns 整理后的文字
 */
export async function callAI(
	content: string,
	systemPrompt: string,
	settings: TranscriptRefineSettings,
): Promise<string> {
	const url = `${settings.apiUrl}/chat/completions`;

	const body = {
		model: settings.model,
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content },
		],
		max_tokens: settings.maxTokens,
		temperature: 0.7,
	};

	let response: RequestUrlResponse;
	try {
		const timeoutPromise = new Promise<never>((_, reject) =>
			window.setTimeout(
				() => reject(new Error('timeout')),
				settings.timeout,
			),
		);

		response = await Promise.race([
			requestUrl({
				url,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${settings.apiKey}`,
				},
				body: JSON.stringify(body),
			}),
			timeoutPromise,
		]);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		if (message.includes('timeout') || message.includes('Timeout')) {
			throw new Error('请求超时，请检查网络或增加超时设置');
		}
		if (message.includes('fetch') || message.includes('network') || message.includes('ENOTFOUND')) {
			throw new Error('网络错误，无法连接到 API 服务器');
		}
		throw new Error(`API 请求失败：${message}`);
	}

	if (response.status !== 200) {
		let errorMsg = `API 返回错误 (${response.status})`;
		try {
			const errBody = response.json as { error?: { message?: string } };
			if (errBody?.error?.message) {
				errorMsg += `：${errBody.error.message}`;
			}
		} catch {
			// ignore JSON parse error
		}

		if (response.status === 401) {
			throw new Error('API Key 无效，请在设置中检查');
		}
		if (response.status === 429) {
			throw new Error('API 请求频率过高，请稍后再试');
		}
		throw new Error(errorMsg);
	}

	const data = response.json as {
		choices?: { message?: { content?: string } }[];
	};

	const result = data?.choices?.[0]?.message?.content;
	if (!result) {
		throw new Error('AI 未返回有效内容，请重试');
	}

	return result;
}

/**
 * 将长文本按段落分割，逐段调用 AI 整理，然后合并
 * 用于整篇文档整理场景
 */
export async function callAIWithChunking(
	content: string,
	systemPrompt: string,
	settings: TranscriptRefineSettings,
	onProgress?: (current: number, total: number) => void,
): Promise<string> {
	const CHUNK_SIZE = 3000;

	// 按空行分割段落，然后合并为适当大小的 chunk
	const paragraphs = content.split(/\n\s*\n/);
	const chunks: string[] = [];
	let current = '';

	for (const para of paragraphs) {
		if (current && current.length + para.length > CHUNK_SIZE) {
			chunks.push(current.trim());
			current = para;
		} else {
			current = current ? `${current}\n\n${para}` : para;
		}
	}
	if (current.trim()) {
		chunks.push(current.trim());
	}

	// 如果只有一个 chunk，直接调用
	if (chunks.length <= 1) {
		return callAI(content, systemPrompt, settings);
	}

	// 逐段整理
	const refinedChunks: string[] = [];
	for (let i = 0; i < chunks.length; i++) {
		onProgress?.(i + 1, chunks.length);
		const chunkPrompt = i === 0
			? systemPrompt
			: `${systemPrompt}\n\n注意：这是长文档的第 ${i + 1}/${chunks.length} 部分，请保持与前文风格一致。`;
		const refined = await callAI(chunks[i]!, chunkPrompt, settings);
		refinedChunks.push(refined);
	}

	return refinedChunks.join('\n\n---\n\n');
}
