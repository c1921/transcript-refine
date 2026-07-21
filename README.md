# Transcript Refine

English | [中文](./README.zh-CN.md)

Obsidian plugin to refine speech-to-text content with AI. Fix errors, improve structure, and turn messy transcripts into clear, readable text.

## Features

- **Refine selection**: Select text → Command Palette or right-click → AI refine → replaces in place
- **Refine whole document**: One-click to restructure the entire document
- **Four preset templates**:
  - General — daily voice notes, fix typos and grammar, split into paragraphs
  - Meeting Minutes — extract topics, group by agenda, list discussion points and action items
  - Interview — preserve Q&A structure, trim redundancy, highlight key quotes, append summary
  - Polish — preserve spoken style, make expression smoother and more natural
- **Custom templates**: Add, edit, and delete your own refine templates
- **Right-click menu**: Select text, right-click to choose a template
- **Multi-API support**: Optimized for DeepSeek, compatible with OpenAI and all compatible APIs
- **Secret storage**: API key managed via Obsidian SecretStorage — never written to plaintext config files

## Usage

1. Fill in **API URL** and **Model** in settings, select your **API Key** from the system keyring
2. Choose a default template
3. Select the speech-to-text content in the editor
4. Trigger via:
   - Command Palette (Ctrl+P) → "AI 整理选中文字" or "AI 整理整篇文档"
   - Right-click → "AI 整理" or "AI 整理为 →"
5. The refined text **replaces the original** in place — undo with Ctrl+Z if unhappy

## Settings

| Setting | Description | Default |
|---|---|---|
| API URL | DeepSeek-compatible API endpoint | `https://api.deepseek.com` |
| API Key | Select or create via system keyring (SecretStorage) | — |
| Model | Model name | `deepseek-v4-flash` |
| Default template | Template used for quick refine | General |
| Timeout | API timeout (ms) | 30000 |
| Max tokens | Output token limit | 4096 |

## Installation

### Manual

1. Download `main.js`, `manifest.json`, `styles.css`
2. Place them in `<Vault>/.obsidian/plugins/transcript-refine/`
3. Enable the plugin in Obsidian settings

### Development

```bash
npm install
npm run dev    # Watch mode
npm run build  # Production build
```
