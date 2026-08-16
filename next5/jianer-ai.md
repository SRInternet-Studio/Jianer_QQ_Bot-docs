# JianerAI 使用指南

JianerAI 是简儿 NEXT 5 的核心 AI 对话插件，基于 JianerCore 框架开发，提供多模型支持、长期记忆系统、Agent 工具调用、内容审核和 TTS 语音合成功能。

## 目录

- [触发规则](#触发规则)
- [AI 模型配置](#ai-模型配置)
- [常用命令](#常用命令)
- [config.json 完整配置](#configjson-完整配置)
- [内容审核系统](#内容审核系统)
- [Agent 工具系统](#agent-工具系统)
- [长期记忆系统](#长期记忆系统)
- [TTS 语音合成](#tts-语音合成)
- [角色扮演与人设](#角色扮演与人设)
- [故障排查](#故障排查)

---

## 触发规则

### 群聊触发

- **必须明确 @ 机器人**：`@简儿 你好` 或 `@简儿`（裸 At）
- **不支持命令前缀**：群聊中 `~` 开头的消息由插件命令系统处理，不会进入 AI 对话
- **黑名单过滤**：`config.black_list` 中的群组不会触发 JianerAI

### 私聊触发

- **直接发送消息**：无需 @ 或前缀，直接发送文本即可
- **命令优先**：`~` 开头的消息仍由插件命令处理

### 飞书触发

- **私聊**：直接发送消息
- **群聊**：使用 mention（@机器人）触发
- **不支持合并转发**：飞书协议不声明或模拟原生合并转发能力

### 多媒体支持

- **图片**：所有协议类型都支持图片输入
- **语音**：OpenAI、Anthropic、Google Gemini 支持语音输入
- **视频**：OpenAI Responses API 和 Google Gemini 支持视频输入

---

## AI 模型配置

### 配置文件位置

在 `aiconfig/` 目录下创建 `.ai.json` 文件，文件名即为模型代码。

### 配置文件结构

```json
{
  "FriendlyName": "模型显示名称",
  "Model": "实际的模型 ID",
  "ResponseType": "协议类型",
  "ApiKey": "your-api-key-here",
  "BaseUrl": "https://api.example.com/v1",
  "Temperature": 0.7,
  "MaxTokens": 2000,
  "TopP": 0.95,
  "FrequencyPenalty": 0.0,
  "PresencePenalty": 0.0,
  "ToolsEnabled": "auto"
}
```

### 支持的协议类型（ResponseType）

| ResponseType | 说明 | 适用模型 | 附件支持 |
| --- | --- | --- | --- |
| `OpenAI Chat Completions` | 标准 OpenAI 兼容 API | OpenAI GPT、DeepSeek、Grok、Qwen、GLM 等 | 图片、语音 |
| `OpenAI Responses` | OpenAI Responses API | GPT-4o Responses | 图片、语音、视频 |
| `Google GenerateContent` | Google Gemini SDK | Gemini 1.5/2.0 系列 | 图片、语音、视频 |
| `Anthropic Messages` | Anthropic Claude API | Claude 3/3.5/4 Opus/Sonnet/Haiku | 图片 |

### 配置参数说明

#### 基础参数

- **FriendlyName**：用户可见的模型名称，显示在 `~ai管理菜单` 中
- **Model**：实际的模型 ID，例如 `gpt-4o`、`gemini-2.0-flash-exp`、`claude-3-5-sonnet-20241022`
- **ResponseType**：协议类型，见上表
- **ApiKey**：API 密钥，从模型提供商获取
- **BaseUrl**：API 端点，OpenAI 兼容服务需要填写完整的 base URL

#### 生成参数

- **Temperature**：控制随机性，范围 0.0~2.0
  - `0.0`：完全确定性，适合审核、数据提取
  - `0.7~1.0`：平衡创造力与连贯性，适合对话
  - `1.5~2.0`：高度随机，适合创意写作
- **MaxTokens**：单次回复最大 token 数，建议 2000~4096
- **TopP**：核采样参数，范围 0.0~1.0，通常保持 0.95
- **FrequencyPenalty**：重复惩罚，范围 -2.0~2.0，默认 0.0
- **PresencePenalty**：话题新颖度，范围 -2.0~2.0，默认 0.0

#### 工具参数

- **ToolsEnabled**：Agent 工具调用模式
  - `"auto"`：模型自主决定是否调用工具（推荐）
  - `"required"`：强制模型使用工具
  - `"false"` 或 `false`：完全禁用工具调用
  - 未配置时默认 `"auto"`

### 配置示例

#### DeepSeek（用于内容审核）

```json
{
  "FriendlyName": "DeepSeek",
  "Model": "deepseek-chat",
  "ResponseType": "OpenAI Chat Completions",
  "ApiKey": "sk-xxx",
  "BaseUrl": "https://api.deepseek.com",
  "Temperature": 0.0,
  "MaxTokens": 1000,
  "ToolsEnabled": false
}
```

#### Grok（X.AI）

```json
{
  "FriendlyName": "Grok",
  "Model": "grok-beta",
  "ResponseType": "OpenAI Chat Completions",
  "ApiKey": "xai-xxx",
  "BaseUrl": "https://api.x.ai/v1",
  "Temperature": 0.8,
  "MaxTokens": 4096,
  "ToolsEnabled": "auto"
}
```

#### Google Gemini

```json
{
  "FriendlyName": "Gemini Flash",
  "Model": "gemini-2.0-flash-exp",
  "ResponseType": "Google GenerateContent",
  "ApiKey": "AIzaSy-xxx",
  "Temperature": 1.0,
  "MaxTokens": 8192,
  "ToolsEnabled": "auto"
}
```

#### Anthropic Claude

```json
{
  "FriendlyName": "Claude Sonnet",
  "Model": "claude-3-5-sonnet-20241022",
  "ResponseType": "Anthropic Messages",
  "ApiKey": "sk-ant-xxx",
  "BaseUrl": "https://api.anthropic.com",
  "Temperature": 0.7,
  "MaxTokens": 8192,
  "ToolsEnabled": "auto"
}
```

### 设置默认模型

在 `config.json` 中配置：

```json
{
  "others": {
    "default_mode": "grok",
    "memory_mode": "grok"
  }
}
```

- **default_mode**：默认对话模型代码（即 `.ai.json` 的文件名，不含扩展名）
- **memory_mode**：记忆提炼模型代码，用于后台异步生成长期记忆

---

## 常用命令

所有命令都使用 `~` 前缀，仅在私聊或群聊中有效。

### AI 模型管理

- `~ai管理菜单` — 列出所有可用的 AI 模型及其配置
- `~切换AI [模型代码]` — 切换当前会话使用的模型
  - 示例：`~切换AI grok`

### 角色扮演

- `~角色扮演` — 查看当前可用的角色预设列表
- `~切换角色 [名称]` — 切换到指定角色
  - 示例：`~切换角色 默认`
- `~添加预设 [名称] [简介] : [内容]` — 创建新的角色预设
  - 示例：`~添加预设 助手 AI助手 : 你是一个专业的技术支持助手`
- `~删除预设 [名称]` — 删除指定的角色预设

### 记忆管理

- `~简儿记忆 帮助` — 查看记忆功能详细帮助
- `~简儿记忆 状态` — 查看当前记忆系统状态（是否启用、审查间隔等）
- `~简儿记忆 开启` — 为当前会话启用长期记忆
- `~简儿记忆 关闭` — 为当前会话禁用长期记忆
- `~简儿记忆 间隔 [秒数]` — 设置记忆审查间隔（最少 60 秒）
- `~简儿记忆 立即生成` — 手动触发记忆生成（管理员）
- `~简儿记忆 列表` — 列出当前角色和会话的所有长期记忆
- `~简儿记忆 删除 [ID]` — 删除指定 ID 的记忆（软删除，可恢复）
- `~简儿记忆 清空` — 清空当前角色和会话的所有记忆（软删除）
- `~简儿记忆 恢复 [ID]` — 恢复已删除的记忆

### Agent 工具

- `~Agent 开启` — 为当前会话启用 Agent 工具调用
- `~Agent 关闭` — 为当前会话禁用 Agent 工具调用
- `~Agent 自动` — 恢复到默认设置（跟随 `agent_enabled_default`）
- `~Agent 状态` — 查看当前 Agent 配置和启用状态
- `~Agent 工具` — 列出所有可用的 Agent 工具及其描述

### TTS 语音

- `~TTS 开启` — 为当前会话启用语音回复
- `~TTS 关闭` — 为当前会话禁用语音回复
- `~TTS 状态` — 查看当前 TTS 设置

### 回复后缀

- `~设置全局后缀 [后缀]` — 设置全局后缀（仅管理员）
  - 示例：`~设置全局后缀 (￣▽￣)`
- `~删除全局后缀` — 删除全局后缀（仅管理员）
- `~设置特定后缀 [后缀]` — 为当前用户设置个人后缀
- `~删除特定后缀` — 删除当前用户的个人后缀

### 其他

- `~注销` — 清空当前会话的短期上下文（对话历史），不影响长期记忆

---

## config.json 完整配置

以下是 `config.json` 中 `others` 字段的完整配置说明。

```json
{
  "others": {
    // ========== 数据库 ==========
    "jianer_ai_db_path": "jianer_ai.db",
    
    // ========== AI 模型 ==========
    "default_mode": "grok",
    "ai_default_model": "grok",
    
    // ========== 内容审核 ==========
    "content_moderation_enabled": true,
    "content_moderation_model": "deepseek",
    "content_moderation_timeout_seconds": 30,
    
    // ========== 长期记忆 ==========
    "memory_mode": "grok",
    "memory_enabled_default": true,
    "memory_interval_seconds_default": 300,
    "memory_scheduler_tick_seconds": 60,
    "memory_min_new_rows_to_generate": 4,
    "memory_topk": 5,
    "memory_cleanup_keep_days": 90,
    "memory_review_external_context_enabled": true,
    
    // ========== 回复分段 ==========
    "max_message_length": 5,
    "ai_reply_chunk_chars": 500,
    
    // ========== TTS 语音 ==========
    "TTS": {
      "voice": "zh-CN-XiaoxiaoNeural",
      "rate": "+0%",
      "volume": "+0%",
      "pitch": "+0Hz"
    },
    
    // ========== Agent 工具 ==========
    "agent_enabled_default": true,
    "agent_max_parallel_calls": 4,
    "agent_total_timeout_seconds": 180,
    "agent_allowed_tools": [
      "get_current_time",
      "calculate_expression",
      "get_sender_info",
      "get_conversation_info",
      "list_my_memories",
      "create_my_memory",
      "update_my_memory",
      "read_recent_chat",
      "search_current_chat",
      "web_search",
      "github_repository",
      "web_browser",
      "render_information_card"
    ],
    
    // ========== 网页浏览器 ==========
    "agent_browser_enabled": true,
    "agent_browser_headless": true,
    "agent_browser_profile_dir": "data/jianer_browser/profile",
    "agent_browser_audit_path": "data/jianer_browser/audit.jsonl",
    "agent_browser_max_pages": 16,
    "agent_browser_idle_seconds": 900
  }
}
```

### 配置项详细说明

#### 数据库配置

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `jianer_ai_db_path` | string | `jianer_ai.db` | 规范化 SQLite 数据库路径 |

#### AI 模型配置

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `default_mode` | string | - | 默认对话模型代码（推荐） |
| `ai_default_model` | string | - | 默认对话模型代码（别名） |

::: tip
`default_mode` 和 `ai_default_model` 是等价的，配置其中一个即可。
:::

#### 内容审核配置

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content_moderation_enabled` | boolean | `false` | 是否启用独立模型内容审核 |
| `content_moderation_model` | string | - | 审核使用的模型代码，启用审核时必须配置 |
| `content_moderation_timeout_seconds` | number | `30` | 单次审核超时（1~120 秒） |

::: warning 重要
- 审核模型必须是已加载的模型，且不跟随用户切换的主对话模型
- 超时、提供商失败或非法审核结果都会按 **fail closed** 拒绝本轮，不会绕过审核
- 审核发生在主模型和任何 Agent 工具之前
:::

#### 长期记忆配置

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `memory_mode` | string | - | 记忆提炼模型代码 |
| `memory_enabled_default` | boolean | `true` | 没有会话覆盖时是否启用记忆 |
| `memory_interval_seconds_default` | number | `300` | 默认记忆审查间隔（秒） |
| `memory_scheduler_tick_seconds` | number | `60` | 记忆调度器检查周期（秒） |
| `memory_min_new_rows_to_generate` | number | `4` | 触发记忆生成的最少新聊天行数 |
| `memory_topk` | number | `5` | 每次对话注入的记忆数量 |
| `memory_cleanup_keep_days` | number | `90` | 原始聊天保留天数（最少 1 天） |
| `memory_review_external_context_enabled` | boolean | `true` | 是否允许回复后记忆审查 |

::: tip
- **记忆审查间隔**：建议设置 300~600 秒，避免频繁调用记忆模型
- **memory_topk**：控制每次对话注入的记忆数量，建议 3~10
- **memory_cleanup_keep_days**：长期记忆、证据摘要、episode 和删除墓碑不受此项清理
:::

#### 回复分段配置

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `max_message_length` | number | `5` | 单次回复最多分段数 |
| `ai_reply_chunk_chars` | number | `500` | 单段目标字符数 |

#### TTS 语音配置

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `TTS.voice` | string | `zh-CN-XiaoxiaoNeural` | Azure TTS 音色 |
| `TTS.rate` | string | `+0%` | 语速调整（-50%~+50%） |
| `TTS.volume` | string | `+0%` | 音量调整（-50%~+50%） |
| `TTS.pitch` | string | `+0Hz` | 音高调整（-50Hz~+50Hz） |

常用音色：
- `zh-CN-XiaoxiaoNeural`：晓晓（女声）
- `zh-CN-YunyangNeural`：云扬（男声）
- `zh-CN-XiaoyiNeural`：晓伊（女声）
- `zh-CN-YunjianNeural`：云健（男声）

#### Agent 工具配置

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `agent_enabled_default` | boolean | `true` | 没有会话覆盖时是否启用 Agent |
| `agent_max_parallel_calls` | number | `4` | 只读工具并发上限 |
| `agent_total_timeout_seconds` | number | `180` | 完整 Agent 轮次总超时 |
| `agent_allowed_tools` | array/string | - | 允许的工具名称数组或逗号分隔字符串 |

::: warning agent_allowed_tools 白名单机制
- **未配置**：允许全部内置工具
- **显式空数组 `[]`**：不暴露任何工具
- **配置白名单**：只允许白名单内的工具
- **记忆写入工具**：需显式加入 `create_my_memory` 和/或 `update_my_memory`
:::

#### 网页浏览器配置

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `agent_browser_enabled` | boolean | `true` | 是否启用 `web_browser` 工具 |
| `agent_browser_headless` | boolean | `true` | 使用无界面 Chromium |
| `agent_browser_profile_dir` | string | `data/jianer_browser/profile` | 共享持久 Profile 目录 |
| `agent_browser_audit_path` | string | `data/jianer_browser/audit.jsonl` | 写请求脱敏审计日志 |
| `agent_browser_max_pages` | number | `16` | 会话页面上限（最大 16） |
| `agent_browser_idle_seconds` | number | `900` | 空闲页面回收时间（秒） |

::: warning 网页浏览器安全注意
- Cookie、localStorage 和外部登录账号会**跨用户、跨重启共享**
- 不建议使用 `web_browser` 登录敏感账号
- 审计日志会记录所有写操作（脱敏后）
:::

---

## 内容审核系统

JianerAI 提供可选的独立审核模型，在主模型前进行内容安全检查。

### 审核流程

```
用户发送消息
    ↓
安全解析引用和附件
    ↓
构造审核请求（包含最近 8 条短期上下文、完整人设）
    ↓
发送给 content_moderation_model
    ↓
    ├─ allow → 正常进入主模型对话
    └─ refuse → 返回拒绝文本，不进入主模型
```

### 审核模型职责

审核模型需要：
1. 区分**正当语境**（医学教育、新闻讨论、风险预防等）与真实违规请求
2. 识别以下违规类型：
   - 露骨色情、未成年人性内容、性剥削
   - 自残伤人、武器、违法犯罪
   - 恶意网络行为、仇恨骚扰、隐私侵害
   - 极端主义支持
3. 命中违规时，按当前人设生成**简短、自然、不复述违规细节**的拒绝文本

### 审核配置示例

```json
{
  "others": {
    "content_moderation_enabled": true,
    "content_moderation_model": "deepseek",
    "content_moderation_timeout_seconds": 30
  }
}
```

推荐使用 DeepSeek 作为审核模型，配置如下：

```json
{
  "FriendlyName": "DeepSeek",
  "Model": "deepseek-chat",
  "ResponseType": "OpenAI Chat Completions",
  "ApiKey": "sk-xxx",
  "BaseUrl": "https://api.deepseek.com",
  "Temperature": 0.0,
  "MaxTokens": 1000,
  "ToolsEnabled": false
}
```

### 审核安全保障

- **Fail Closed**：超时、提供商失败或非法审核结果都会拒绝本轮，不会绕过审核
- **附件审核**：附件只有在审核模型所用协议支持对应格式时才能送审，不支持时按 Fail Closed 拒绝
- **隐私保护**：审核日志只记录模型、分类代码、耗时和字符/附件数量，不记录审核理由或原始违规内容
- **人设模仿**：完整人设只供审核模型在 `refuse` 时模仿身份、自称、称呼方式、情感立场、句式节奏和口癖，不能参与安全分类
- **不影响主模型**：审核返回 `allow` 后，发送给主模型的消息、历史、人设、附件、工具声明和协议均保持原样，审核结果不会进入主模型请求

### 关闭审核

将 `content_moderation_enabled` 设为 `false` 即可完全关闭审核：

```json
{
  "others": {
    "content_moderation_enabled": false
  }
}
```

---

## Agent 工具系统

JianerAI 内置丰富的 Agent 工具，模型可以根据需要主动调用这些工具来获取信息、执行操作。

### 内置工具清单

#### 基础工具

| 工具名称 | 说明 | 风险等级 |
| --- | --- | --- |
| `get_current_time` | 获取当前时间（UTC+8） | READ_ONLY |
| `calculate_expression` | 安全算术计算（支持四则运算、幂运算、括号） | READ_ONLY |
| `get_sender_info` | 获取发言人资料（昵称、群名片、QQ 号等） | READ_ONLY |
| `get_conversation_info` | 获取会话资料（群号、群名、会话类型等） | READ_ONLY |

#### 记忆工具

| 工具名称 | 说明 | 风险等级 |
| --- | --- | --- |
| `list_my_memories` | 列出当前角色和会话的所有长期记忆 | READ_ONLY |
| `create_my_memory` | 创建新的长期记忆 | MUTATING |
| `update_my_memory` | 更新已有的长期记忆 | MUTATING |
| `read_recent_chat` | 读取近期聊天记录（最多 50 条） | READ_ONLY |
| `search_current_chat` | 搜索当前会话的聊天记录 | READ_ONLY |

::: tip 记忆工具说明
- **个人记忆（scope=individual）**：跨群聊保存对某个人的记忆
- **群记忆（scope=group）**：只保存对当前群的记忆
- **memory_text**：人设化主观回忆，用第一人称记录
- **evidence**：客观事实证据，分开存储
:::

#### 网络工具

| 工具名称 | 说明 | 风险等级 | 白名单要求 |
| --- | --- | --- | --- |
| `web_search` | 网页搜索（基于 ddgs） | READ_ONLY | 需显式加入 |
| `github_repository` | GitHub 仓库查看（只读） | READ_ONLY | 需显式加入 |
| `web_browser` | 状态化网页浏览器 | MUTATING | 需显式加入 |

##### web_search 详细说明

- **搜索引擎**：通过 `DDGS_BACKEND` 环境变量配置
  - 可选：`auto`、`bing`、`brave`、`duckduckgo`、`google`、`grokipedia`、`mojeek`、`wikipedia`、`yahoo`、`yandex`
  - 默认：`yandex`
  - 多引擎回退：显式设置为 `auto`
- **区域**：固定为 `cn-zh`
- **安全搜索**：固定为 `moderate`
- **限制**：模型不能指定代理、请求头、任意后端或待抓取 URL

##### github_repository 详细说明

- **功能**：只读查看仓库概况、目录、UTF-8 文本代码、提交、Pull Request 与 Issue
- **认证**：
  - 公开仓库：默认可匿名读取
  - 私有仓库：通过 `GITHUB_TOKEN` 环境变量配置（不会暴露给模型）
- **代码搜索**：必须配置 `GITHUB_TOKEN`

##### web_browser 详细说明

- **功能**：打开、快照、点击、填写、选择、按键、滚动、前进后退、刷新、等待和关闭
- **浏览器**：共享持久 Chromium Profile
- **隔离**：每个会话拥有独立 Page
- **安全注意**：Cookie、localStorage 和外部登录账号会跨用户、跨重启共享

###### Windows 首次运行前安装浏览器

```powershell
playwright install chromium
```

#### 制图工具

| 工具名称 | 说明 | 风险等级 |
| --- | --- | --- |
| `render_information_card` | 通用信息卡片（HTML/CSS 渲染） | READ_ONLY |

### 工具配置

#### 允许所有内置工具（默认）

```json
{
  "others": {
    "agent_enabled_default": true
  }
}
```

不配置 `agent_allowed_tools` 时，允许所有内置工具。

#### 禁用所有工具

```json
{
  "others": {
    "agent_allowed_tools": []
  }
}
```

#### 配置白名单

```json
{
  "others": {
    "agent_allowed_tools": [
      "get_current_time",
      "calculate_expression",
      "get_sender_info",
      "get_conversation_info",
      "list_my_memories",
      "create_my_memory",
      "update_my_memory",
      "web_search"
    ]
  }
}
```

::: warning 重要
- 配置白名单后，**记忆写入工具**需显式加入 `create_my_memory` 和/或 `update_my_memory`
- `web_search`、`github_repository`、`web_browser` 需显式加入白名单
:::

### 和风天气工具（可选）

JianerAI 可按需注册和风天气 Tool，覆盖天气、空气质量、预警等功能。

#### 配置

在 `.env` 中：

```dotenv
QWEATHER_API_HOST=your-api-host.qweatherapi.com
QWEATHER_PROJECT_ID=your-project-id
QWEATHER_CREDENTIAL_ID=your-credential-id
QWEATHER_PRIVATE_KEY_PATH=secrets/qweather-ed25519-private.pem
```

#### 可用工具

| 工具名称 | 说明 |
| --- | --- |
| `qweather_geo` | 城市查询、POI 查询 |
| `qweather_weather` | 当前、逐日、逐小时天气 |
| `qweather_minutely` | 分钟级降水预报 |
| `qweather_warning` | 天气预警 |
| `qweather_indices` | 生活指数预报 |
| `qweather_air_quality` | 空气质量 |
| `qweather_time_machine` | 历史天气 |
| `qweather_tropical_cyclone` | 热带气旋 |
| `qweather_ocean` | 潮汐预报 |
| `qweather_solar_radiation` | 太阳辐射 |
| `qweather_astronomy` | 日出日落、月相 |

::: tip
和风天气工具需要在 `agent_allowed_tools` 中显式加入对应的工具名称。
:::

---

## 长期记忆系统

JianerAI 提供按人设（角色预设）隔离的规范化长期记忆系统，支持个人记忆、群记忆、对话片段和证据摘要。

### 记忆架构

```
jianer_ai.db
├── persona_memories           # 长期记忆主表
├── persona_memory_evidences   # 证据摘要
├── persona_chat_episodes      # 对话片段
├── persona_chat_transcripts   # 原始聊天记录
└── job_memory_reviews         # 待审查任务
```

#### 按人设隔离

- 每个角色预设有独立的记忆存储
- 切换角色后，记忆也会切换
- 不同角色之间的记忆互不干扰

#### 记忆类型

| 类型 | scope | 说明 | 示例 |
| --- | --- | --- | --- |
| 个人记忆 | `individual` | 跨群聊保存对某个人的记忆 | "张三喜欢吃火锅" |
| 群记忆 | `group` | 只保存对当前群的记忆 | "这个群经常讨论技术话题" |

#### 存储内容

- **memory_text**：人设化主观回忆，用第一人称记录
- **evidence**：客观事实证据，分开存储
- **对话片段**：保存用户说了什么、机器人如何回答
- **证据摘要**：保留来源摘要

### 记忆生成流程

```
用户发送消息 → AI 回复成功发送
    ↓
创建审查任务（写入 job_memory_reviews）
    ↓
独立 memory_mode 模型异步审查
    ↓
    ├─ create → 创建新记忆
    ├─ update → 更新已有记忆
    └─ no-op → 不生成记忆
```

::: tip
- 记忆生成是**异步**的，不阻塞用户等待时间
- 只允许 `create`、`update` 或 `no-op`，不允许删除操作
- 需要足够的新聊天行数（`memory_min_new_rows_to_generate`）才会触发生成
:::

### 记忆配置

```json
{
  "others": {
    "memory_mode": "grok",
    "memory_enabled_default": true,
    "memory_interval_seconds_default": 300,
    "memory_scheduler_tick_seconds": 60,
    "memory_min_new_rows_to_generate": 4,
    "memory_topk": 5,
    "memory_cleanup_keep_days": 90,
    "memory_review_external_context_enabled": true
  }
}
```

#### 配置说明

- **memory_mode**：记忆提炼模型代码，建议使用与主模型相同的模型
- **memory_enabled_default**：默认是否启用记忆
- **memory_interval_seconds_default**：记忆审查间隔（秒），建议 300~600 秒
- **memory_scheduler_tick_seconds**：调度器检查周期（秒），建议 60 秒
- **memory_min_new_rows_to_generate**：触发记忆生成的最少新聊天行数
- **memory_topk**：每次对话注入的记忆数量，建议 3~10
- **memory_cleanup_keep_days**：原始聊天保留天数（最少 1 天），长期记忆不受此项清理
- **memory_review_external_context_enabled**：是否允许把当前会话最近最多 50 条、合计最多 8000 字的聊天原文发送给 `memory_mode` 用作回复后记忆审查

### 记忆管理命令

- `~简儿记忆 状态` — 查看当前记忆系统状态
- `~简儿记忆 开启` — 启用记忆
- `~简儿记忆 关闭` — 禁用记忆
- `~简儿记忆 间隔 [秒数]` — 设置审查间隔（最少 60 秒）
- `~简儿记忆 立即生成` — 手动触发记忆生成（管理员）
- `~简儿记忆 列表` — 列出所有长期记忆
- `~简儿记忆 删除 [ID]` — 删除指定记忆（软删除，可恢复）
- `~简儿记忆 清空` — 清空所有记忆（软删除）
- `~简儿记忆 恢复 [ID]` — 恢复已删除的记忆

### 数据库备份

```bash
# 停止简儿
systemctl stop jianer-bot

# 备份数据库
cp jianer_ai.db /backup/
cp jianer_ai.db-shm /backup/  # 如果存在
cp jianer_ai.db-wal /backup/  # 如果存在

# 启动简儿
systemctl start jianer-bot
```

---

## TTS 语音合成

JianerAI 支持 Azure TTS（Text-to-Speech）语音合成，可以将文本回复转换为语音消息。

### 启用 TTS

在群聊或私聊中使用命令：

```
~TTS 开启
```

### 禁用 TTS

```
~TTS 关闭
```

### 查看 TTS 状态

```
~TTS 状态
```

### TTS 配置

在 `config.json` 中配置：

```json
{
  "others": {
    "TTS": {
      "voice": "zh-CN-XiaoxiaoNeural",
      "rate": "+0%",
      "volume": "+0%",
      "pitch": "+0Hz"
    }
  }
}
```

#### 常用音色

| 音色名称 | 说明 |
| --- | --- |
| `zh-CN-XiaoxiaoNeural` | 晓晓（女声） |
| `zh-CN-YunyangNeural` | 云扬（男声） |
| `zh-CN-XiaoyiNeural` | 晓伊（女声） |
| `zh-CN-YunjianNeural` | 云健（男声） |
| `zh-CN-XiaochenNeural` | 晓辰（女声） |
| `zh-CN-XiaomengNeural` | 晓梦（女声） |
| `zh-CN-XiaoxuanNeural` | 晓萱（女声） |
| `zh-CN-XiaohanNeural` | 晓涵（女声） |
| `zh-CN-XiaomoNeural` | 晓墨（女声） |
| `zh-CN-XiaoqiuNeural` | 晓秋（女声） |

完整音色列表请参考 [Azure TTS 官方文档](https://learn.microsoft.com/zh-cn/azure/ai-services/speech-service/language-support?tabs=tts)。

#### 参数调整

- **rate**：语速调整，范围 `-50%` ~ `+50%`
  - 示例：`"+10%"`（加快 10%）、`"-20%"`（减慢 20%）
- **volume**：音量调整，范围 `-50%` ~ `+50%`
  - 示例：`"+10%"`（提高 10%）、`"-20%"`（降低 20%）
- **pitch**：音高调整，范围 `-50Hz` ~ `+50Hz`
  - 示例：`"+10Hz"`（提高 10Hz）、`"-10Hz"`（降低 10Hz）

---

## 角色扮演与人设

JianerAI 支持角色扮演功能，允许用户创建和切换不同的角色预设。

### 查看角色列表

```
~角色扮演
```

### 切换角色

```
~切换角色 默认
```

### 创建新角色

```
~添加预设 助手 AI助手 : 你是一个专业的技术支持助手，擅长解答编程问题。
```

格式：`~添加预设 [名称] [简介] : [完整人设内容]`

### 删除角色

```
~删除预设 助手
```

::: warning
删除角色后，该角色的所有长期记忆也会被隐藏（软删除），但不会立即物理删除。
:::

### 人设模板变量

在人设内容中可以使用以下变量，它们会在运行时被替换：

| 变量 | 说明 |
| --- | --- |
| `{bot_name}` | 机器人名称 |
| `{bot_qq}` | 机器人 QQ 号 |
| `{sender_nickname}` | 发言人昵称 |
| `{sender_card}` | 发言人群名片 |
| `{sender_qq}` | 发言人 QQ 号 |
| `{group_name}` | 群名称 |
| `{group_id}` | 群号 |
| `{current_time}` | 当前时间 |
| `{agent_tools}` | 当前可用的 Agent 工具名称列表 |
| `{agent_tools_info}` | 当前可用的 Agent 工具详细信息 |

示例：

```
你是{bot_name}，一个友好的 AI 助手。
当前时间：{current_time}
你正在与 {sender_nickname} 交谈。
```

---

## 故障排查

### AI 不回复

1. 检查是否在黑名单中：`config.black_list`
2. 群聊是否明确 @ 了机器人
3. 检查日志是否有错误信息
4. 确认 `default_mode` 配置的模型已加载

### 记忆不生成

1. 使用 `~简儿记忆 状态` 确认记忆已启用
2. 确认审查间隔已过（默认 300 秒）
3. 确认有足够的新聊天行数（默认 4 行）
4. 查看 `memory_mode` 模型是否正确配置
5. 检查日志中是否有记忆审查任务失败的错误

### Agent 工具不调用

1. 使用 `~Agent 状态` 确认 Agent 已启用
2. 检查模型配置中 `ToolsEnabled` 是否为 `"auto"` 或 `"required"`
3. 确认 `agent_allowed_tools` 白名单包含所需工具
4. 检查模型是否支持 Function Calling

### 审核误拒

1. 检查审核模型（`content_moderation_model`）是否配置正确
2. 尝试调整审核模型的 `Temperature`（建议 0.0）
3. 查看日志中的审核分类代码，判断是否为误判
4. 考虑临时关闭审核（`content_moderation_enabled: false`）

### 数据库锁定

如果遇到数据库锁定错误：

```bash
# 停止简儿
systemctl stop jianer-bot

# 删除 WAL 和 SHM 文件
rm jianer_ai.db-wal jianer_ai.db-shm

# 启动简儿
systemctl start jianer-bot
```

### API 密钥失效

1. 检查 `aiconfig/*.ai.json` 中的 `ApiKey` 是否正确
2. 确认 API 密钥未过期
3. 检查 `BaseUrl` 是否正确
4. 尝试使用 `curl` 直接测试 API 端点

### 网页浏览器无法启动

Windows 下首次运行前需要安装 Chromium：

```powershell
playwright install chromium
```

Linux 下需要安装系统依赖：

```bash
playwright install-deps chromium
playwright install chromium
```

---

## 更多信息

详细配置和高级用法请参考：

- [长期记忆系统详解](/next5/memory)
- [Agent 工具开发](/next5/plugin-dev)
- [部署指南](/next5/deployment)
- [协议配置](/next5/protocols)
- `plugins/JianerAI/README.md`（项目源码）
