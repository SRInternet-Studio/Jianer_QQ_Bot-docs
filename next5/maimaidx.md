# 舞萌 DX 配置

简儿 NEXT 5 内置完整的舞萌 DX 功能，移植自 `nonebot-plugin-maimaidx` v3.0.13。

## 功能概览

- **成绩查询**：B50、AP50、单曲成绩、分数线
- **曲目搜索**：按曲名、定数、BPM、曲师、谱师查歌
- **别名管理**：本地别名、社区别名投票、推送开关
- **猜歌游戏**：猜歌、猜曲绘
- **数据表格**：定数表、完成表、进度表、分数列表
- **查分器支持**：水鱼查分器、落雪查分器 OAuth 绑定

## 环境准备

### 静态资源

下载并解压舞萌静态资源到 `data/maimaidx/static`，至少包含：

```
data/maimaidx/static/
├── font/
├── mai/pic/
├── mai/cover/
├── mai/shougou/
└── mai/plate_version/
```

必须存在 `mai/cover/0.png`。

### 本地配置

在 `.env` 中配置：

```dotenv
# 舞萌资源路径
MAIMAIDX_PATH=data/maimaidx/static
MAIMAIDX_STATE_PATH=data/maimaidx/private
MAIMAIDX_ALIAS_PUSH=true
MAIMAIDX_ALIAS_PROXY=false
SAVE_IN_MEMORY=true
ASSETS_ONLINE=true

# 水鱼查分器
DIVINGFISH_TOKEN=
DIVINGFISH_PROBER_PROXY=false

# 落雪查分器 OAuth
LXNS_DEV_TOKEN=
LX_CLIENT_ID=
LX_CLIENT_SECRET=
REDIRECT_URI=urn:ietf:wg:oauth:2.0:oob
LXNS_BIND_PRIVATE_ONLY=true
```

## 查分器配置

### 水鱼查分器

1. 访问 [水鱼查分器开发者平台](https://www.diving-fish.com/maimaidx/prober/)
2. 获取 Developer Token
3. 填入 `.env` 的 `DIVINGFISH_TOKEN`

### 落雪查分器 OAuth

#### 创建 OAuth 应用

1. 访问 [落雪查分器开发者中心](https://maimai.lxns.net/developer)
2. 创建新应用，勾选 **"无回调地址"**
3. 权限只开启 **"读取玩家数据"**
4. 获取 Client ID 和 Client Secret

#### 配置

在 `.env` 中：

```dotenv
LX_CLIENT_ID=your-client-id
LX_CLIENT_SECRET=your-client-secret
REDIRECT_URI=urn:ietf:wg:oauth:2.0:oob
LXNS_BIND_PRIVATE_ONLY=true
```

#### 用户绑定流程

1. **私聊机器人**发送 `lxbind`
2. 打开返回的授权链接
3. 在落雪页面点击授权
4. 复制页面显示的授权码
5. **私聊机器人**发送授权码（或 `授权码：xxx`）

::: warning 安全提示
- 授权码只在私聊中提交有效
- 授权码 10 分钟内有效
- 每个授权码只能使用一次
- Token 使用 DPAPI 加密存储（Windows）
:::

## 常用命令

### 成绩查询

- `b50` — 查询自己的 B50
- `b50 @成员` — 查询被 @ 成员的 B50
- `b50 QQ号` — 查询指定 QQ 的 B50（公开）
- `ap50` — 查询 AP50
- `info` / `minfo` — 查询个人信息
- `ginfo` — 查询群内排行
- `分数线` — 查询定数分数线

### 曲目搜索

- `查歌 [曲名]` — 按曲名搜索
- `定数查歌 [定数]` — 按定数搜索
- `bpm查歌 [BPM]` — 按 BPM 搜索
- `曲师查歌 [曲师]` — 按曲师搜索
- `谱师查歌 [谱师]` — 按谱师搜索
- `id [ID]` — 按 ID 查询曲目

### 别名管理

- `查询别名 [曲名]` — 查询曲目别名
- `别名 [别名] [曲名]` — 添加本地别名
- `申请别名 [别名] [曲名]` — 申请社区别名
- `投票 [别名]` — 为别名投票
- `别名推送 开启/关闭` — 群别名推送
- `全局别名推送 开启/关闭` — 全局别名推送

### 猜歌游戏

- `猜歌` — 开始猜歌
- `猜曲绘` — 猜曲绘游戏
- `重置猜歌` — 重置当前猜歌
- `开启猜歌` / `关闭猜歌` — 控制群猜歌功能

### 数据表格

- `定数表` — 生成定数表
- `完成表` — 生成完成表
- `进度表` — 生成进度表
- `等级进度 [等级]` — 查询等级进度
- `分数列表 [难度]` — 列出指定难度成绩

### 管理命令

- `更新曲库` — 更新曲目数据（管理员）
- `更新别名库` — 更新别名数据（管理员）
- `更新定数表` — 更新定数数据（管理员）
- `更新完成表` — 更新完成表数据（管理员）

## JianerAI Agent 工具

舞萌 DX 插件会自动注册 Agent 工具到 JianerAI：

| 工具名称 | 功能 | 权限 |
| --- | --- | --- |
| `maimaidx_b50` | 查询 B50 并发送图片 | 只读 |
| `maimaidx_song_search` | 搜索曲目返回结构化结果 | 只读 |
| `maimaidx_song_info` | 发送曲目详情图片 | 只读 |
| `maimaidx_player_song_score` | 发送单曲成绩图片 | 只读 |
| `maimaidx_rating_ranking` | 发送排行榜图片 | 只读 |

::: tip
这些工具只在 OneBot/Milky 会话声明 `SEND_IMAGE` 能力时提供。查询他人成绩只使用水鱼公开数据，不会读取其 OAuth Token。
:::

## 数据存储

### OAuth Token

- 存储路径：`data/maimaidx/private/user.db`
- Windows 使用 DPAPI 加密
- ACL 收紧到当前账户、SYSTEM 和管理员
- 旧版数据会自动迁移

### 别名数据

- 本地别名：存储在本地数据库
- 社区别名：从 Yuri-YuzuChaN 别名数据源同步

### 静态资源

- 字体、图片、牌子等大型资源
- 不纳入备份（可重新获取）

## 故障排查

### 提示静态资源不完整

检查 `data/maimaidx/static` 目录结构，确保包含所有必需文件。

### OAuth 绑定失败

- 确认在私聊中操作
- 检查授权码是否在 10 分钟内提交
- 确认 `.env` 中的 Client ID 和 Secret 正确

### 图片生成失败

- 确认安装了 Playwright Chromium
- Linux 确认安装了 `fonts-noto-cjk`
- 检查 `data/maimaidx/static/font` 目录

### 查询失败

- 水鱼查分器：检查 Developer Token
- 落雪查分器：确认用户已完成 OAuth 绑定
- 公开查询：使用水鱼查分器的公开接口

详细配置请参考 `plugins/MaimaiDX/README.md`。
