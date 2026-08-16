# 协议配置指南

简儿 NEXT 5 基于 JianerCore 框架，支持多种 QQ 机器人协议。本文档详细介绍各协议的配置方法、实现端选择和故障排查。

## 目录

- [协议与实现端](#协议与实现端)
- [Milky 协议](#milky-协议)
- [OneBot 11 协议](#onebot-11-协议)
- [飞书长连接](#飞书长连接)
- [Kritor 协议（不推荐）](#kritor-协议不推荐)
- [配置示例](#配置示例)
- [故障排查](#故障排查)

---

## 协议与实现端

### 协议类型

简儿 NEXT 5 支持以下协议：

| 协议 | 稳定性 | 功能完整性 | 说明 |
| --- | --- | --- | --- |
| **Milky** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 新式协议，性能优秀 |
| **OneBot 11** | ⭐⭐⭐ | ⭐⭐⭐ | 标准化协议，生态成熟 |
| **飞书** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 企业级长连接协议 |
| **Kritor** | ⭐⭐ | ⭐⭐ | 实验性协议，不推荐 |

### 协议实现端

协议实现端是实际连接 QQ 并提供 API 的程序：

| 实现端 | 支持协议 | 推荐度 | 官方网站 |
| --- | --- | --- | --- |
| **LLBot** | Milky, OneBot 11 | 🔥 强烈推荐 | [luckylillia.com](https://luckylillia.com/) |
| **NapCatQQ** | OneBot 11 | ✅ 推荐 | [GitHub](https://github.com/NapNeko/NapCatQQ) |
| **LLOneBot** | OneBot 11 | ⚠️ 可用 | [GitHub](https://github.com/LLOneBot/LLOneBot) |
| **OpenShamrock** | OneBot 11 | ⚠️ 可用 | [GitHub](https://github.com/whitechi73/OpenShamrock) |

::: tip 推荐配置
- **Milky 协议**：**LLBot**（强烈推荐）
- **OneBot 11 协议**：**LLBot**（强烈推荐）或 **NapCatQQ**（推荐）
- **企业内部**：**飞书长连接**
:::

---

## Milky 协议

Milky 是一个新式 QQ 机器人协议，性能和兼容性优秀。

### 协议特点

- ✅ 性能优秀
- ✅ 功能完整
- ✅ 支持 Bearer Token 认证
- ✅ 事件推送及时

### 支持的实现端

目前支持 Milky 协议的实现端：

- **LLBot**（强烈推荐）

### 配置方法

在 `config.json` 中配置：

```json
{
  "protocol": "Milky",
  "uin": 123456789,
  "connections": {
    "Milky": {
      "mode": "HTTPC",
      "host": "127.0.0.1",
      "port": 3010,
      "listener_host": "127.0.0.1",
      "listener_port": 5003,
      "retries": 5,
      "auth": "replace-with-a-long-random-token"
    }
  },
  "connection": {
    "mode": "HTTPC",
    "host": "127.0.0.1",
    "port": 3010,
    "listener_host": "127.0.0.1",
    "listener_port": 5003,
    "retries": 5,
    "auth": "replace-with-a-long-random-token"
  }
}
```

### 配置说明

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `protocol` | string | - | 协议类型，填写 `"Milky"` |
| `uin` | number | - | 机器人 QQ 号 |
| `mode` | string | `"HTTPC"` | 连接模式 |
| `host` | string | `"127.0.0.1"` | 协议实现端地址 |
| `port` | number | `3010` | 协议实现端端口 |
| `listener_host` | string | `"127.0.0.1"` | 简儿监听地址 |
| `listener_port` | number | `5003` | 简儿监听端口 |
| `retries` | number | `5` | 连接重试次数 |
| `auth` | string | - | Bearer Token（可选但推荐） |

::: warning 重要
`connections` 是多协议配置表，而顶层 `connection` 是兼容字段。切换协议时，两处都要修改以保持一致。
:::

### LLBot + Milky 配置步骤

1. **获取 LLBot**
   - 访问 [https://luckylillia.com/](https://luckylillia.com/)
   - 下载并安装 LLBot

2. **配置 LLBot**
   - 在 LLBot 中启用 Milky 协议
   - 设置端口（默认 3010）
   - 配置认证 Token（可选）
   - 登录 QQ 账号

3. **配置简儿**
   - 按上述示例配置 `config.json`
   - 确保端口和认证 Token 与 LLBot 一致

4. **启动测试**
   - 先启动 LLBot
   - 再启动简儿
   - 在 QQ 群中 @ 机器人测试

### 协议端要求

协议实现端（LLBot）需要：

- 在配置的地址提供 WebSocket 事件流：`ws://127.0.0.1:3010/event`
- 在同一地址提供 Milky HTTP 操作 API
- 如果配置了 `auth`，需要使用相同的 Bearer Token

### 支持的消息类型

- ✅ 文本消息
- ✅ 图片消息
- ✅ 语音消息
- ✅ 视频消息
- ✅ At 消息
- ✅ 合并转发
- ✅ 回复消息
- ✅ 戳一戳
- ✅ 群文件上传

---

## OneBot 11 协议

OneBot 11 是一个开放的 QQ 机器人协议标准，被多个实现端支持。

### 协议特点

- ✅ 标准化协议
- ✅ 生态成熟
- ✅ 多种实现可选
- ⚠️ 稳定性因实现而异

### 支持的实现端

目前支持 OneBot 11 协议的实现端：

| 实现端 | 推荐度 | 说明 |
| --- | --- | --- |
| **LLBot** | 🔥 强烈推荐 | 官网：[luckylillia.com](https://luckylillia.com/) |
| **NapCatQQ** | ✅ 推荐 | GitHub：[NapNeko/NapCatQQ](https://github.com/NapNeko/NapCatQQ) |
| **LLOneBot** | ⚠️ 可用 | 基于 QQNT |
| **OpenShamrock** | ⚠️ 可用 | 基于 Android QQ |
| **go-cqhttp** | ❌ 不推荐 | 已停止维护 |

### 配置方法

在 `config.json` 中配置：

```json
{
  "protocol": "OneBot",
  "uin": 123456789,
  "connections": {
    "OneBot": {
      "mode": "WSC",
      "host": "127.0.0.1",
      "port": 8080,
      "access_token": ""
    }
  },
  "connection": {
    "mode": "WSC",
    "host": "127.0.0.1",
    "port": 8080,
    "access_token": ""
  }
}
```

### 配置说明

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `protocol` | string | - | 协议类型，填写 `"OneBot"` |
| `uin` | number | - | 机器人 QQ 号 |
| `mode` | string | `"WSC"` | 连接模式（推荐 `"WSC"`） |
| `host` | string | `"127.0.0.1"` | 协议实现端地址 |
| `port` | number | `8080` | 协议实现端端口 |
| `access_token` | string | - | 访问令牌（可选） |

### LLBot + OneBot 11 配置步骤

1. **获取 LLBot**
   - 访问 [https://luckylillia.com/](https://luckylillia.com/)
   - 下载并安装 LLBot

2. **配置 LLBot**
   - 在 LLBot 中启用 OneBot 11 协议
   - 设置端口（默认 8080）
   - 配置访问令牌（可选）
   - 登录 QQ 账号

3. **配置简儿**
   - 按上述示例配置 `config.json`
   - 确保端口和访问令牌与 LLBot 一致

4. **启动测试**
   - 先启动 LLBot
   - 再启动简儿
   - 在 QQ 群中 @ 机器人测试

### NapCatQQ + OneBot 11 配置步骤

1. **获取 NapCatQQ**
   - 访问 [https://github.com/NapNeko/NapCatQQ](https://github.com/NapNeko/NapCatQQ)
   - 下载并安装 NapCatQQ

2. **配置 NapCatQQ**
   - 启用 OneBot 11 WebSocket 服务
   - 设置端口（例如 8080）
   - 配置访问令牌（可选）
   - 登录 QQ 账号

3. **配置简儿**
   - 按上述示例配置 `config.json`
   - 确保端口和访问令牌与 NapCatQQ 一致

4. **启动测试**
   - 先启动 NapCatQQ
   - 再启动简儿
   - 在 QQ 群中 @ 机器人测试

### 支持的消息类型

OneBot 11 协议标准支持：

- ✅ 文本消息
- ✅ 图片消息
- ✅ At 消息
- ✅ 回复消息
- ⚠️ 语音消息（部分实现支持）
- ⚠️ 视频消息（部分实现支持）
- ⚠️ 合并转发（部分实现支持）

::: tip
具体支持的消息类型取决于协议实现端。LLBot 和 NapCatQQ 都提供较完整的支持。
:::

---

## 飞书长连接

飞书长连接是飞书开放平台提供的机器人协议，适合企业内部使用。

### 主要特性

- ✅ 官方支持
- ✅ 企业级稳定性
- ✅ 丰富的权限管理
- ✅ 完善的文档

### 前置要求

1. 注册飞书开放平台账号：[open.feishu.cn](https://open.feishu.cn/)
2. 创建企业自建应用
3. 获取 App ID 和 App Secret
4. 配置事件订阅和机器人权限

### 配置方法

在 `config.json` 中配置：

```json
{
  "protocol": "Feishu",
  "connections": {
    "Feishu": {
      "app_id": "cli_xxxxxxxxxxxxx",
      "app_secret": "your-app-secret-here",
      "verification_token": "your-verification-token",
      "encrypt_key": ""
    }
  }
}
```

### 配置说明

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `protocol` | string | - | 协议类型，填写 `"Feishu"` |
| `app_id` | string | - | 飞书应用 ID |
| `app_secret` | string | - | 飞书应用 Secret |
| `verification_token` | string | - | 事件订阅验证 Token |
| `encrypt_key` | string | - | 消息加密密钥（可选） |

### 权限配置

在飞书开放平台应用管理页面，需要添加以下权限：

#### 必需权限

- `im:message` — 获取与发送单聊、群组消息
- `im:message:group_at_msg:readonly` — 接收群聊中 @ 机器人的消息
- `im:message:private_msg:readonly` — 接收单聊消息
- `im:resource` — 获取群组信息

#### 可选权限

- `im:contact` — 获取用户信息
- `im:chat` — 获取群组详细信息

::: warning
不推荐订阅 `im:message.group_msg`（群组全量消息），会收到大量消息导致性能问题。
:::

### 事件订阅

在飞书开放平台配置以下事件：

- `im.message.receive_v1` — 接收消息
- `im.message.message_read_v1` — 消息已读（可选）

### 支持的消息类型

- ✅ 文本消息
- ✅ 图片消息
- ✅ 富文本消息
- ✅ 卡片消息
- ✅ At 消息（mention）
- ❌ 合并转发（不支持）

### 飞书特性

- **私聊触发**：飞书私聊中可以直接发送消息触发 AI，无需 @ 机器人
- **群聊触发**：飞书群聊中必须 @ 机器人才会触发 AI 对话
- **不支持合并转发**：飞书协议不支持原生合并转发能力

---

## Kritor 协议（不推荐）

Kritor 是一个实验性协议，目前在 `jianer-bot>=0.92.5` 中存在 `NotImplementedError`，**不推荐在生产环境使用**。

### 已知问题

- ❌ 部分核心功能未实现
- ❌ 稳定性不足
- ❌ 文档不完善

::: danger 警告
Kritor 协议目前存在严重问题，请勿在生产环境使用。建议使用 Milky 或 OneBot 11 协议。
:::

---

## 配置示例

### LLBot + Milky（强烈推荐）

```json
{
  "owner": [123456789],
  "protocol": "Milky",
  "uin": 987654321,
  "connections": {
    "Milky": {
      "mode": "HTTPC",
      "host": "127.0.0.1",
      "port": 3010,
      "listener_host": "127.0.0.1",
      "listener_port": 5003,
      "retries": 5,
      "auth": "your-secure-token-here"
    }
  },
  "connection": {
    "mode": "HTTPC",
    "host": "127.0.0.1",
    "port": 3010,
    "listener_host": "127.0.0.1",
    "listener_port": 5003,
    "retries": 5,
    "auth": "your-secure-token-here"
  },
  "others": {
    "ROOT_User": ["123456789"],
    "reminder": "~",
    "bot_name": "你的机器人名称"
  }
}
```

### LLBot + OneBot 11

```json
{
  "owner": [123456789],
  "protocol": "OneBot",
  "uin": 987654321,
  "connections": {
    "OneBot": {
      "mode": "WSC",
      "host": "127.0.0.1",
      "port": 8080,
      "access_token": ""
    }
  },
  "connection": {
    "mode": "WSC",
    "host": "127.0.0.1",
    "port": 8080,
    "access_token": ""
  },
  "others": {
    "ROOT_User": ["123456789"],
    "reminder": "~",
    "bot_name": "你的机器人名称"
  }
}
```

### NapCatQQ + OneBot 11

```json
{
  "owner": [123456789],
  "protocol": "OneBot",
  "uin": 987654321,
  "connections": {
    "OneBot": {
      "mode": "WSC",
      "host": "127.0.0.1",
      "port": 8080,
      "access_token": ""
    }
  },
  "connection": {
    "mode": "WSC",
    "host": "127.0.0.1",
    "port": 8080,
    "access_token": ""
  },
  "others": {
    "ROOT_User": ["123456789"],
    "reminder": "~",
    "bot_name": "你的机器人名称"
  }
}
```

---

## 故障排查

### 连接失败

#### 检查协议实现端状态

**Windows:**
```powershell
# 检查 Milky 协议端口
netstat -ano | findstr "3010"

# 检查 OneBot 协议端口
netstat -ano | findstr "8080"
```

**Linux:**
```bash
# 检查 Milky 协议端口
netstat -tulnp | grep 3010

# 检查 OneBot 协议端口
ss -tulnp | grep 8080
```

#### 检查配置

1. 确认 `config.json` 中的协议配置正确
2. 检查 `host` 和 `port` 是否正确
3. 验证 `auth` 或 `access_token` 是否匹配
4. 确认 `uin`（QQ 号）是否正确
5. 确认协议实现端（LLBot/NapCatQQ）已启动并登录
6. 检查 `connections` 和 `connection` 是否一致

#### 查看日志

```bash
# 查看简儿日志
tail -f logs/jianer.log

# Windows PowerShell
Get-Content logs\jianer.log -Tail 50 -Wait
```

### 消息收发异常

#### 消息收不到

1. **检查协议实现端登录状态**
   - 确认 QQ 账号已登录
   - 检查是否被风控或冻结

2. **检查群组权限**
   - 确认机器人在目标群组中
   - 检查是否被管理员禁言
   - 验证是否在黑名单中

3. **检查触发规则**
   - 群聊需要 @ 机器人
   - 私聊直接发送即可
   - 命令前缀 `~` 只用于插件命令

#### 消息发送失败

1. **检查发送权限**
   - 确认机器人有发送消息的权限
   - 检查是否被风控限流
   - 验证群组是否允许发送

2. **检查消息格式**
   - 确认消息内容符合协议要求
   - 检查图片/语音/视频是否过大
   - 验证消息编码是否正确

3. **查看错误日志**
   - 查看简儿日志中的错误信息
   - 查看协议实现端日志中的详细错误

### 协议实现端选择建议

| 需求 | 推荐方案 |
| --- | --- |
| **最佳性能和稳定性** | LLBot + Milky |
| **最大兼容性** | LLBot + OneBot 11 |
| **已有 NapCatQQ** | NapCatQQ + OneBot 11 |
| **开发测试** | LLBot/NapCatQQ + OneBot 11 |

### 常见错误

#### "Protocol connection failed"

**原因：**
- 协议实现端未启动
- 端口配置错误
- 防火墙阻止连接

**解决方法：**
1. 确认协议实现端正常运行
2. 检查 `host` 和 `port` 配置
3. 关闭防火墙或添加例外规则

#### "Authentication failed"

**原因：**
- `auth` 或 `access_token` 不匹配
- 协议实现端未配置认证

**解决方法：**
1. 检查 `auth` 配置是否正确
2. 确认协议实现端的认证配置
3. 尝试留空 `auth` 字段

---

## 更多信息

详细配置和高级用法请参考：

- [部署指南](/next5/deployment)
- [JianerAI 使用指南](/next5/jianer-ai)
- [插件开发指南](/next5/plugin-dev)
- LLBot 官方网站：[https://luckylillia.com/](https://luckylillia.com/)
- NapCatQQ GitHub：[https://github.com/NapNeko/NapCatQQ](https://github.com/NapNeko/NapCatQQ)
- 飞书开放平台：[https://open.feishu.cn/](https://open.feishu.cn/)
