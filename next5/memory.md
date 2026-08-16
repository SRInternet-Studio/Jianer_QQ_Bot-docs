# 长期记忆系统

简儿 NEXT 5 提供完整的长期记忆系统，支持按人设隔离的个人记忆、群记忆、对话片段和回复后记忆审查。

## 架构设计

### 数据隔离

- **按人设（preset）隔离**：每个角色预设有独立的物理表
- **个人记忆跨会话**：同一 canonical 用户的记忆可在私聊和群聊中共享
- **群记忆按群隔离**：每个群的记忆独立存储，不跨群读取
- **对话片段按会话隔离**：每个会话有自己的对话历史

### 数据库结构

`jianer_ai.db` 规范化 SQLite 数据库：

```
jianer_ai.db
├── conversations  # 会话元数据
├── chat_history   # 客观聊天记录
├── <preset>_personal_memories     # 个人记忆（按人设）
├── <preset>_group_memories        # 群记忆（按人设）
├── <preset>_episodes              # 对话片段（按人设）
├── <preset>_evidence_summaries    # 证据摘要（按人设）
└── memory_review_tasks            # 待审查任务队列
```

每个人设会动态创建以下表：
- `{preset}_personal_memories`
- `{preset}_group_memories`
- `{preset}_episodes`
- `{preset}_evidence_summaries`

### 记忆类型

| 类型 | 表名 | 作用域 | 说明 |
| --- | --- | --- | --- |
| 个人记忆 | `{preset}_personal_memories` | 跨会话 | 对某个用户的长期记忆 |
| 群记忆 | `{preset}_group_memories` | 单群 | 对某个群的长期记忆 |
| 对话片段 | `{preset}_episodes` | 单会话 | 用户说了什么、机器人如何回答 |
| 证据摘要 | `{preset}_evidence_summaries` | - | 记忆的来源摘要 |

## 配置

### 基础配置

在 `config.json` 中：

```json
{
  "others": {
    "jianer_ai_db_path": "jianer_ai.db",
    "memory_enabled_default": true,
    "memory_interval_seconds_default": 300,
    "memory_scheduler_tick_seconds": 60,
    "memory_min_new_rows_to_generate": 2,
    "memory_topk": 5,
    "memory_cleanup_keep_days": 90,
    "memory_review_external_context_enabled": true,
    "memory_mode": "grok"
  }
}
```

### 配置项说明

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `jianer_ai_db_path` | string | `"jianer_ai.db"` | 数据库文件路径 |
| `memory_enabled_default` | boolean | `true` | 默认是否启用记忆 |
| `memory_interval_seconds_default` | number | `300` | 记忆审查最小间隔（秒） |
| `memory_scheduler_tick_seconds` | number | `60` | 后台调度器检查间隔 |
| `memory_min_new_rows_to_generate` | number | `2` | 触发审查的最少新聊天数 |
| `memory_topk` | number | `5` | 召回的记忆数量 |
| `memory_cleanup_keep_days` | number | `90` | 客观聊天保留天数（最少 1 天） |
| `memory_review_external_context_enabled` | boolean | `true` | 是否把近期聊天原文发给审查模型 |
| `memory_mode` | string | `"grok"` | 记忆审查使用的模型代码 |

## 记忆生成流程

### 1. 用户发送消息

用户在群聊或私聊发送消息，触发 AI 对话。

### 2. AI 回复成功

AI 回复成功发送给用户后，系统会：
1. 将本轮聊天写入 `chat_history` 表（客观聊天记录）
2. 创建一个待审查任务到 `memory_review_tasks` 队列
3. 继续正常服务用户，不阻塞

### 3. 后台调度器

独立的后台调度器每 60 秒（`memory_scheduler_tick_seconds`）检查一次：
- 是否有会话达到审查间隔
- 是否有足够的新聊天行数（`memory_min_new_rows_to_generate`）
- 如果满足条件，启动一个审查任务

### 4. 记忆审查

审查模型（`memory_mode`）会接收：
- 当前会话最近最多 50 条、合计最多 8000 字的聊天原文
- 当前人设的完整提示
- 已有的个人记忆、群记忆列表

审查模型只能返回：
- `create`：创建新记忆
- `update`：更新已有记忆
- `no-op`：不需要记录

### 5. 应用审查结果

审查结果会：
- 创建/更新对应的记忆表
- 记录证据摘要（来源于哪些聊天）
- 更新对话片段
- 标记任务完成

## 使用命令

### 查看记忆状态

```
~简儿记忆 状态
```

显示：
- 当前会话是否启用记忆
- 审查间隔设置
- 上次审查时间
- 待审查任务数量

### 启用/禁用记忆

```
~简儿记忆 开启
~简儿记忆 关闭
```

启用或禁用当前会话的记忆功能。

### 调整审查间隔

```
~简儿记忆 间隔 600
```

设置当前会话的审查间隔为 600 秒（10 分钟）。

### 立即生成记忆

```
~简儿记忆 立即生成
```

不等待间隔，立即触发一次记忆审查。

### 列出记忆

```
~简儿记忆 列表
```

列出当前人设、当前会话的所有记忆（个人和群记忆）。

### 删除记忆

```
~简儿记忆 删除 <ID>
```

永久删除指定 ID 的记忆（创建删除墓碑）。

### 清空记忆

```
~简儿记忆 清空
```

清空当前人设、当前会话的所有记忆（不包括对话片段）。

### 恢复记忆

```
~简儿记忆 恢复 <ID>
```

恢复被删除的记忆（移除删除墓碑）。

## Agent 工具

JianerAI 为 Agent 提供了记忆相关的工具：

### list_my_memories

列出当前会话的长期记忆。

**参数：**
- `memory_type`：`"personal"` 或 `"group"`
- `limit`：返回数量

**返回：**
```json
[
  {
    "id": 123,
    "content": "用户喜欢吃苹果",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
]
```

### create_my_memory

创建新的长期记忆。

**参数：**
- `memory_type`：`"personal"` 或 `"group"`
- `content`：记忆内容

**返回：**
```json
{
  "id": 124,
  "content": "用户讨厌吃香蕉"
}
```

### update_my_memory

更新已有的长期记忆。

**参数：**
- `memory_id`：记忆 ID
- `new_content`：新内容

**返回：**
```json
{
  "id": 123,
  "old_content": "用户喜欢吃苹果",
  "new_content": "用户特别喜欢吃红富士苹果"
}
```

### read_recent_chat

读取近期聊天记录（客观记录）。

**参数：**
- `limit`：返回行数

**返回：**
```json
[
  {
    "timestamp": "2024-01-01T12:00:00Z",
    "speaker": "user",
    "content": "今天天气真好"
  },
  {
    "timestamp": "2024-01-01T12:00:05Z",
    "speaker": "assistant",
    "content": "是的，阳光明媚"
  }
]
```

### search_current_chat

在当前会话的聊天记录中搜索关键词。

**参数：**
- `keyword`：搜索关键词
- `limit`：返回数量

**返回：**
匹配的聊天记录列表。

## 隐私与安全

### 数据保留

- **客观聊天**：默认保留 90 天（`memory_cleanup_keep_days`）
- **长期记忆**：永久保留（除非手动删除）
- **对话片段**：永久保留
- **证据摘要**：永久保留
- **删除墓碑**：永久保留

### 删除墓碑

当用户删除一条记忆时，系统会：
1. 标记该记忆为已删除
2. 创建删除墓碑（tombstone）
3. 后续审查不会再创建相同内容的记忆
4. 使用 `~简儿记忆 恢复` 可以移除墓碑并恢复记忆

### 外部上下文发送

当 `memory_review_external_context_enabled` 为 `true` 时：
- 审查模型会收到最近最多 50 条、合计最多 8000 字的聊天原文
- 这是部署时需要单独确认的数据发送边界
- 关闭后仍保存客观聊天和 episode，但不创建待审查任务

## 数据库维护

### 手动触发清理

清理会自动在后台执行，也可以手动触发：

```python
from plugins.JianerAI.memory import MemoryStore

memory_store = MemoryStore("jianer_ai.db")
memory_store.cleanup_old_chat(keep_days=90)
```

### 备份数据库

::: warning
SQLite 使用 WAL 模式时，备份需要同时复制：
- `jianer_ai.db`
- `jianer_ai.db-wal`
- `jianer_ai.db-shm`
:::

```bash
# 停止简儿
systemctl stop jianer-bot

# 备份数据库
cp jianer_ai.db* /backup/

# 启动简儿
systemctl start jianer-bot
```

## 故障排查

### 记忆不生成

1. 检查 `~简儿记忆 状态`，确认启用
2. 确认审查间隔已过
3. 确认有足够的新聊天行数
4. 查看 `memory_mode` 模型是否正确配置

### 数据库锁定

如果遇到数据库锁定：
1. 停止简儿
2. 确认没有其他进程占用数据库
3. 删除 `.db-shm` 和 `.db-wal` 文件
4. 重新启动

### 记忆召回不准确

调整 `memory_topk` 值：
- 增大：召回更多记忆，可能引入噪音
- 减小：召回更精准，可能遗漏相关记忆

### 审查任务堆积

如果后台任务堆积：
1. 检查 `memory_mode` 模型是否正常工作
2. 适当增加 `memory_interval_seconds_default`
3. 检查日志中的审查错误

## 最佳实践

### 间隔设置

- **高频会话**：300-600 秒（5-10 分钟）
- **普通会话**：600-1800 秒（10-30 分钟）
- **低频会话**：1800+ 秒（30 分钟以上）

### 人设隔离

为不同用途创建不同人设：
- 日常聊天：使用默认人设
- 专业咨询：创建专业人设
- 娱乐互动：创建娱乐人设

每个人设的记忆完全隔离，互不干扰。

### 数据备份

建议每周备份一次 `jianer_ai.db`，保留最近 4 周的备份。

### 清理策略

- 普通部署：`memory_cleanup_keep_days: 90`
- 高负载部署：`memory_cleanup_keep_days: 30`
- 长期存档：`memory_cleanup_keep_days: 365`

长期记忆、对话片段和删除墓碑不受清理影响。
