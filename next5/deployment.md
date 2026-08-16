# 部署指南

本文面向第一次部署简儿 NEXT 5 的维护者，覆盖 Windows 与 Debian/Ubuntu Linux。部署目标是：

- 启动一个 Jianer Bot 进程
- 连接一个已经登录的 QQ 协议实现端（如 LLBot、NapCatQQ），使用 Milky 或 OneBot 11 协议，或连接飞书开放平台
- 正确保存本地配置、AI 密钥、SQLite 数据和插件状态
- 在前台验收通过后，把进程交给 Windows 任务计划程序或 Linux `systemd` 常驻运行

::: danger 重要提示
当前仓库的 `dev` 分支是 Canary 开发分支，不应直接作为稳定生产版本使用。请先用测试账号、测试群和独立机器验收，再决定是否长期运行。QQ 协议实现端不属于本仓库，账号登录与平台风控风险需要部署者自行评估。
:::

## 目录

- [部署结构](#部署结构)
- [环境要求](#环境要求)
- [获取代码](#获取代码)
- [安装系统依赖](#安装系统依赖)
- [安装 Python 依赖](#安装-python-依赖)
- [创建主配置](#创建主配置)
- [配置 AI 模型](#配置-ai-模型)
- [启动运行](#启动运行)
- [常驻运行](#常驻运行)
- [数据备份](#数据备份)
- [更新升级](#更新升级)
- [故障排查](#故障排查)

---

## 部署结构

本项目本身不会登录 QQ。QQ 部署至少包含两个进程：**协议实现端**负责登录账号并提供 API，**Jianer** 负责业务逻辑和插件。

```
┌─────────────────────┐         ┌─────────────────────┐
│  协议实现端          │◄───────►│  Jianer_QQ_bot      │
│  LLBot/NapCatQQ     │  事件/API │  python main.py     │
│  (Milky/OneBot 11)  │         │                     │
└─────────────────────┘         └─────────────────────┘
                                          │
                                          ├──► 本地状态（SQLite/JSON/INI）
                                          └──► 外部服务（AI/天气/查分器）
```

一次只在 `config.json -> protocol` 中启用一个协议。

### 协议与实现端

| 协议 | 推荐实现端 | 推荐度 | 备注 |
| --- | --- | --- | --- |
| **Milky** | LLBot | 🔥 强烈推荐 | 性能优秀，支持 Bearer Token |
| **OneBot 11** | LLBot, NapCatQQ | ✅ 推荐 | 标准化协议，生态成熟 |
| **飞书** | - | ✅ 推荐 | 企业级稳定，无需公网端口 |
| **Kritor** | - | ❌ 不推荐 | JianerCore 0.92.5 存在 NotImplementedError |

---

## 环境要求

### Python 版本要求

| 简儿版本 | Python 要求 | 推荐版本 |
| --- | --- | --- |
| 简儿 NEXT 5 | Python >= **3.11**, < **3.14** | **3.12.x** |

::: warning 重要
NEXT 5 使用了较新的 Python 语法特性（如 Pattern Matching、嵌套 f-string），需要 Python 3.11 及以上。使用过低版本会在启动时报错。不建议首次部署直接使用尚未验证的 Python 3.13/3.14。
:::

### 必需组件

- **Python 3.11 或 3.12**
- **Git**
- **FFmpeg 与 FFprobe**（用于音视频处理）
- 能访问所选协议实现端和外部 API 的网络
- 一个普通权限的专用系统账号（Linux 不要用 `root`）

### 完整功能所需组件

- **Playwright Chromium**：JianerAI 网页工具、HTML 信息卡和部分舞萌功能会使用
- **中文字体**：Linux 生成中文图片时推荐安装 Noto CJK 字体
- **MaimaiDX 静态资源**：仅在需要舞萌图片功能时准备

::: tip
如果只想先验证基础消息收发，可以暂不配置 AI、天气和舞萌外部服务；但依赖安装仍建议一次完成。
:::

---

## 获取代码

当前 NEXT 5 工作分支是 `dev`：

```bash
git clone --branch dev --single-branch https://github.com/SRInternet-Studio/Jianer_QQ_bot.git
cd Jianer_QQ_bot
```

如果代码已经由发布包、同步工具或管理员放到服务器，只需进入包含 `main.py` 的项目根目录。

---

## 安装系统依赖

### Windows

1. **安装 Python**
   - 下载 64 位 Python 3.11 或 3.12：[python.org/downloads](https://www.python.org/downloads/)
   - 安装时勾选 "Add Python to PATH"

2. **验证安装**
   ```powershell
   py -0p
   py -3.12 --version
   git --version
   ```

3. **安装 FFmpeg**（可选，用于音视频功能）
   - 下载 FFmpeg：[ffmpeg.org/download.html](https://ffmpeg.org/download.html)
   - 解压并添加到系统 PATH

4. **验证 FFmpeg**
   ```powershell
   ffmpeg -version
   ffprobe -version
   ```

### Linux (Debian/Ubuntu)

1. **检查 Python 版本**
   ```bash
   python3 --version
   ```

2. **安装基础包**
   ```bash
   sudo apt update
   sudo apt install -y git python3 python3-venv python3-pip ffmpeg fonts-noto-cjk
   ```

::: warning
如果 `python3 --version` 低于 3.11，请使用发行版为当前版本提供的 Python 3.11/3.12 软件包或受信任的软件源，不要用旧解释器继续安装。
:::

---

## 安装 Python 依赖

::: danger 不要直接安装到系统 Python
请使用虚拟环境，避免污染系统 Python 环境。
:::

### Windows PowerShell

```powershell
# 创建虚拟环境
py -3.12 -m venv .venv

# 激活虚拟环境
Set-ExecutionPolicy -Scope Process Bypass
.\.venv\Scripts\Activate.ps1

# 升级 pip
python -m pip install --upgrade pip

# 安装依赖
python -m pip install -r requirements.txt

# 检查依赖
python -m pip check
```

### Linux

```bash
# 创建虚拟环境
python3 -m venv .venv

# 激活虚拟环境
source .venv/bin/activate

# 升级 pip
python -m pip install --upgrade pip

# 安装依赖
python -m pip install -r requirements.txt

# 检查依赖
python -m pip check
```

### 验证 JianerCore 版本

```bash
python -c "import importlib.metadata as m; print(m.version('jianer-bot'))"
```

::: tip
`requirements.txt` 当前允许安装 `jianer-bot>=0.92.5`，因此未来重新部署时可能得到比本教程验证版本更新的 JianerCore。每次验收都应记录实际版本。

如果要保留一次已经验收通过的完整依赖快照，可在验收后执行 `python -m pip freeze`，把结果保存到部署记录中。不要用旧快照覆盖新提交声明的依赖范围。
:::

### 安装 Playwright Chromium

**Windows:**

```powershell
python -m playwright install chromium
```

**Linux:**

```bash
# 先用管理员权限安装 Chromium 所需系统库
sudo .venv/bin/python -m playwright install-deps chromium

# 再以实际运行机器人的账号下载浏览器
.venv/bin/python -m playwright install chromium
```

::: warning Linux 用户注意
浏览器默认安装到运行账号的用户目录。以后由 `systemd` 使用 `jianer` 用户运行时，也必须让同一个 `jianer` 用户执行第二条安装命令，否则服务可能找不到 Chromium。
:::

---

## 创建主配置

### 复制配置模板

**Windows:**

```powershell
Copy-Item config.example.json config.json
Copy-Item .env.example .env
```

**Linux:**

```bash
cp config.example.json config.json
cp .env.example .env
chmod 600 config.json .env
```

::: tip
`config.json` 和 `.env` 已被仓库忽略，不会被 Git 跟踪。
:::

### 编辑 config.json

至少修改以下字段：

| 字段 | 是否必填 | 含义与注意事项 |
| --- | --- | --- |
| `owner` | 是 | 至少放一个维护者 ID，不能保留空数组 |
| `protocol` | 是 | `"Milky"`、`"OneBot"` 或 `"Feishu"` |
| `uin` | QQ 必填 | 机器人自己的 QQ 号；飞书可保留 `0` |
| `connections.<协议>` | 是 | 当前协议的连接参数 |
| `connection` | 是 | 兼容字段；建议完整复制当前活动连接 |
| `others.ROOT_User` | 是 | 至少放一个可信根管理员 |
| `others.reminder` | 是 | 命令前缀，模板为 `~` |
| `others.bot_name` | 是 | 机器人中文名称（不能用"简儿"） |
| `others.bot_name_en` | 是 | 机器人英文名称 |
| `others.Auto_approval` | 是 | 入群邀请自动审批关键词，不需要时使用空数组 |
| `black_list` | 否 | 当前主要用于阻止指定群使用 JianerAI |
| `log_level` | 否 | 首次部署可用 `INFO`，排障时临时改为 `DEBUG` |

### 协议配置示例

#### LLBot + Milky 配置

使用 LLBot 作为协议实现端，启用 Milky 协议：

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
      "auth": "your-access-token-here"
    }
  },
  "connection": {
    "mode": "HTTPC",
    "host": "127.0.0.1",
    "port": 3010,
    "listener_host": "127.0.0.1",
    "listener_port": 5003,
    "retries": 5,
    "auth": "your-access-token-here"
  }
}
```

#### LLBot + OneBot 11 配置

使用 LLBot 作为协议实现端，启用 OneBot 11 协议：

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

#### Milky 协议配置（通用）

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

::: warning 重要
`connections` 是多协议配置表，而顶层 `connection` 是兼容字段。当前 OneBot 运行路径直接读取顶层 `connection`。切换到 OneBot 时，如果只改 `connections.OneBot`，机器人可能仍连接原来的 Milky 端口。
:::

#### OneBot 11 配置

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

#### 飞书配置

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

### 戳一戳回复（可选）

建议给 `others` 增加戳一戳回复，缺失时机器人只会记录"不接受戳一戳"：

```json
{
  "others": {
    "poke_rejection_phrases": [
      "不要一直戳我啦！",
      "别戳了别戳了",
      "再戳就生气了！"
    ]
  }
}
```

---

## 配置 AI 模型

### 创建 AI 配置文件

在 `aiconfig/` 目录创建 `.ai.json` 文件，文件名即为模型代码。

#### 示例：Grok

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

保存为 `aiconfig/grok.ai.json`。

#### 示例：DeepSeek（用于审核）

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

保存为 `aiconfig/deepseek.ai.json`。

### 配置默认模型

在 `config.json` 的 `others` 字段中：

```json
{
  "others": {
    "default_mode": "grok",
    "memory_mode": "grok"
  }
}
```

详细的 AI 配置请参考 [JianerAI 使用指南](/next5/jianer-ai)。

---

## 启动运行

### 1. 启动协议实现端

确保你选择的协议实现端已经启动并完成 QQ 登录。

**LLBot（推荐）:**
- 访问 [https://luckylillia.com/](https://luckylillia.com/) 获取 LLBot
- 按照官方文档配置并启动
- 在 LLBot 中启用 **Milky 协议**（推荐）或 **OneBot 11 协议**
- 确保运行在配置的端口上
- 登录 QQ 账号

**NapCatQQ:**
- 下载 NapCatQQ：[github.com/NapNeko/NapCatQQ](https://github.com/NapNeko/NapCatQQ)
- 按照官方文档配置并启动
- 启用 **OneBot 11 协议**（NapCatQQ 只支持 OneBot 11）
- 登录 QQ 账号

### 2. 启动简儿

```bash
# 确保虚拟环境已激活
# Windows: .\.venv\Scripts\Activate.ps1
# Linux: source .venv/bin/activate

# 启动简儿
python main.py
```

### 3. 验证连接

观察日志，确认：

1. ✅ JianerCore 启动且版本正确
   ```
   [INFO] JianerCore 0.92.5 启动
   ```

2. ✅ 插件加载成功
   ```
   [INFO] 加载插件: jianerbot-plugin-alconna
   [INFO] 加载插件: JianerAI
   ```

3. ✅ 协议连接成功
   ```
   [INFO] Milky 连接成功  # 使用 Milky 协议
   [INFO] OneBot 连接成功  # 或使用 OneBot 11 协议
   ```

4. ✅ 发送 `~帮助` 能收到回复

### 4. 测试功能

在 QQ 群中测试：

```
# 基础命令
~ping
~帮助
~关于

# AI 对话（需要 @ 机器人）
@机器人 你好

# 角色扮演
~角色扮演
~切换角色 默认

# Agent 工具
~Agent 状态
~Agent 工具
```

---

## 常驻运行

### Windows 任务计划程序

1. **创建启动脚本**

创建 `start_jianer.bat`：

```batch
@echo off
cd /d D:\path\to\Jianer_QQ_bot
call .venv\Scripts\activate.bat
python main.py
```

2. **创建任务计划**

- 打开"任务计划程序"
- 创建基本任务
- 触发器：系统启动时
- 操作：启动程序，选择 `start_jianer.bat`
- 条件：取消勾选"只有在计算机使用交流电源时才启动此任务"

3. **配置重启策略**

- 在任务属性中，设置"如果任务失败，重新启动"
- 尝试重新启动的次数：3
- 间隔时间：1 分钟

### Linux systemd

1. **创建服务文件**

```bash
sudo nano /etc/systemd/system/jianer-bot.service
```

2. **编辑服务配置**

```ini
[Unit]
Description=Jianer QQ Bot NEXT 5
After=network.target

[Service]
Type=simple
User=jianer
WorkingDirectory=/home/jianer/Jianer_QQ_bot
ExecStart=/home/jianer/Jianer_QQ_bot/.venv/bin/python main.py
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

3. **启用并启动服务**

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启用开机自启
sudo systemctl enable jianer-bot

# 启动服务
sudo systemctl start jianer-bot

# 查看状态
sudo systemctl status jianer-bot

# 查看日志
sudo journalctl -u jianer-bot -f
```

4. **常用管理命令**

```bash
# 停止服务
sudo systemctl stop jianer-bot

# 重启服务
sudo systemctl restart jianer-bot

# 禁用开机自启
sudo systemctl disable jianer-bot

# 查看最近 100 行日志
sudo journalctl -u jianer-bot -n 100

# 查看今天的日志
sudo journalctl -u jianer-bot --since today
```

---

## 数据备份

### 需要备份的文件

| 文件/目录 | 说明 | 重要性 |
| --- | --- | --- |
| `config.json` | 主配置文件 | ⭐⭐⭐⭐⭐ |
| `.env` | 环境变量配置 | ⭐⭐⭐⭐⭐ |
| `aiconfig/*.ai.json` | AI 模型配置 | ⭐⭐⭐⭐⭐ |
| `jianer_ai.db*` | 长期记忆数据库 | ⭐⭐⭐⭐⭐ |
| `*.db` | 其他数据库文件 | ⭐⭐⭐⭐ |
| `data/` | 运行时数据 | ⭐⭐⭐ |
| `logs/` | 日志文件 | ⭐⭐ |

### 备份脚本

**Linux:**

```bash
#!/bin/bash
# backup_jianer.sh

BACKUP_DIR="/backup/jianer"
BOT_DIR="/home/jianer/Jianer_QQ_bot"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p "${BACKUP_DIR}/${DATE}"

# 停止服务
sudo systemctl stop jianer-bot

# 备份文件
cp "${BOT_DIR}/config.json" "${BACKUP_DIR}/${DATE}/"
cp "${BOT_DIR}/.env" "${BACKUP_DIR}/${DATE}/"
cp -r "${BOT_DIR}/aiconfig" "${BACKUP_DIR}/${DATE}/"
cp "${BOT_DIR}"/*.db* "${BACKUP_DIR}/${DATE}/" 2>/dev/null || true
cp -r "${BOT_DIR}/data" "${BACKUP_DIR}/${DATE}/" 2>/dev/null || true

# 压缩备份
cd "${BACKUP_DIR}"
tar -czf "jianer_backup_${DATE}.tar.gz" "${DATE}"
rm -rf "${DATE}"

# 启动服务
sudo systemctl start jianer-bot

echo "备份完成: jianer_backup_${DATE}.tar.gz"
```

**Windows PowerShell:**

```powershell
# backup_jianer.ps1

$BackupDir = "D:\backup\jianer"
$BotDir = "D:\path\to\Jianer_QQ_bot"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"

# 创建备份目录
New-Item -ItemType Directory -Path "$BackupDir\$Date" -Force

# 备份文件
Copy-Item "$BotDir\config.json" "$BackupDir\$Date\"
Copy-Item "$BotDir\.env" "$BackupDir\$Date\"
Copy-Item "$BotDir\aiconfig" "$BackupDir\$Date\" -Recurse
Copy-Item "$BotDir\*.db*" "$BackupDir\$Date\" -ErrorAction SilentlyContinue
Copy-Item "$BotDir\data" "$BackupDir\$Date\" -Recurse -ErrorAction SilentlyContinue

# 压缩备份
Compress-Archive -Path "$BackupDir\$Date" -DestinationPath "$BackupDir\jianer_backup_$Date.zip"
Remove-Item "$BackupDir\$Date" -Recurse

Write-Host "备份完成: jianer_backup_$Date.zip"
```

### 定期备份

**Linux (crontab):**

```bash
# 每天凌晨 3 点自动备份
0 3 * * * /home/jianer/backup_jianer.sh
```

---

## 更新升级

### 1. 备份当前版本

在更新前先备份当前版本和数据。

### 2. 拉取最新代码

```bash
# 进入项目目录
cd Jianer_QQ_bot

# 拉取最新代码
git pull origin dev
```

### 3. 更新依赖

```bash
# 激活虚拟环境
source .venv/bin/activate  # Linux
# .\.venv\Scripts\Activate.ps1  # Windows

# 更新依赖
python -m pip install --upgrade pip
python -m pip install -r requirements.txt --upgrade
python -m pip check
```

### 4. 检查配置变更

查看 `config.example.json` 是否有新增配置项，手动合并到 `config.json`。

### 5. 重启服务

**Linux:**

```bash
sudo systemctl restart jianer-bot
sudo systemctl status jianer-bot
```

**Windows:**

重启任务计划程序中的任务。

### 6. 验证更新

- 检查日志中的 JianerCore 版本
- 测试基础功能
- 测试 AI 对话
- 检查长期记忆是否正常

---

## 故障排查

### 启动失败

#### Python 版本过低

**错误信息：**
```
SyntaxError: invalid syntax
```

**解决方法：**
确认 Python 版本 >= 3.11：
```bash
python --version
```

#### 依赖缺失

**错误信息：**
```
ModuleNotFoundError: No module named 'jianer'
```

**解决方法：**
确认虚拟环境已激活并重新安装依赖：
```bash
source .venv/bin/activate
python -m pip install -r requirements.txt
```

### 协议连接失败

#### 连接超时

**错误信息：**
```
[ERROR] Protocol connection failed: Connection timeout
```

**解决方法：**
1. 检查协议实现端（LLBot/NapCatQQ）是否正常运行
2. 确认 `host` 和 `port` 配置正确
3. 检查防火墙设置

#### 认证失败

**错误信息：**
```
[ERROR] Authentication failed
```

**解决方法：**
1. 检查 `auth` 或 `access_token` 配置
2. 确认与协议实现端的认证配置一致

### AI 不回复

#### 模型未配置

**症状：**
@ 机器人后无反应，日志中有模型加载错误。

**解决方法：**
1. 检查 `aiconfig/` 目录下是否有对应的 `.ai.json` 文件
2. 确认 `config.json` 中的 `default_mode` 正确
3. 验证 API 密钥有效

#### 触发规则错误

**症状：**
群聊中发送消息无反应。

**解决方法：**
群聊必须明确 @ 机器人：
```
@机器人 你好
```

### 数据库锁定

**错误信息：**
```
[ERROR] database is locked
```

**解决方法：**

```bash
# 停止简儿
sudo systemctl stop jianer-bot  # Linux
# 或手动停止进程

# 删除 WAL 和 SHM 文件
rm jianer_ai.db-wal jianer_ai.db-shm

# 启动简儿
sudo systemctl start jianer-bot
```

### 内存/CPU 占用高

#### 检查插件

1. 查看哪些插件占用资源最多
2. 禁用不必要的插件
3. 优化插件代码

#### 优化配置

在 `config.json` 中调整：

```json
{
  "others": {
    "memory_interval_seconds_default": 600,
    "agent_max_parallel_calls": 2,
    "agent_total_timeout_seconds": 120
  }
}
```

### 查看日志

**Linux:**

```bash
# 查看服务日志
sudo journalctl -u jianer-bot -f

# 查看最近 100 行
sudo journalctl -u jianer-bot -n 100

# 查看今天的日志
sudo journalctl -u jianer-bot --since today

# 查看文件日志
tail -f logs/jianer.log
```

**Windows:**

```powershell
# 查看日志文件
Get-Content logs\jianer.log -Tail 50 -Wait
```

---

## 更多信息

详细配置和高级用法请参考：

- [协议配置指南](/next5/protocols)
- [JianerAI 使用指南](/next5/jianer-ai)
- [长期记忆系统](/next5/memory)
- [舞萌 DX 配置](/next5/maimaidx)
- [插件开发指南](/next5/plugin-dev)
- 项目根目录的 `DEPLOYMENT.md` 文件
