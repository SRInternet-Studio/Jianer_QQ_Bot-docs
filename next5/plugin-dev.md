# 插件开发指南

简儿 NEXT 5 使用 JianerCore 新式插件系统，基于 `PluginMetadata` 和 `Alconna Command` 开发。

## 插件基础

### 插件形式

插件可以以下列形式存在于 `plugins/` 目录：

| 形式 | 说明 | 入口文件 |
| --- | --- | --- |
| 单文件 | `.py` 或 `.pyw` 文件 | 文件本身 |
| 目录 | 文件夹形式 | `setup.py`（必需） |

### 插件启用/禁用

- 文件名或目录名以 `d_` 开头的插件会被忽略加载
- 使用 `~启用插件` / `~禁用插件` 命令管理
- 使用 `~重载插件` 热重载所有插件

## 创建插件

### 单文件插件

在 `plugins/` 下创建 `hello.py`：

```python
from jianer.plugins import PluginMetadata
from jianer.plugins.builtin.alconna import Command

__plugin_meta__ = PluginMetadata(
    name="jianerbot-plugin-hello",
    description="A simple hello world plugin",
    usage="{reminder}你好 —> 打招呼",
    requires={"jianerbot-plugin-alconna"},
)

@Command("你好").handle()
async def hello_handler(event, actions):
    from jianer import common as Manager, segments as Segments
    
    await actions.send(
        group_id=getattr(event, "group_id", None),
        user_id=getattr(event, "user_id", None),
        message=Manager.Message(Segments.Text("你好！我是简儿 👋"))
    )
    return True
```

### 目录插件

在 `plugins/hello/` 下创建 `setup.py`：

```python
from jianer.plugins import PluginMetadata
from jianer.plugins.builtin.alconna import Command
from jianer import common as Manager, segments as Segments

__plugin_meta__ = PluginMetadata(
    name="jianerbot-plugin-hello",
    description="A hello world plugin",
    usage="{reminder}你好 —> 打招呼",
    requires={"jianerbot-plugin-alconna"},
)

@Command("你好").handle()
async def hello_handler(event, actions):
    await actions.send(
        group_id=getattr(event, "group_id", None),
        message=Manager.Message(Segments.Text("你好！"))
    )
    return True
```

## PluginMetadata

### 必需字段

```python
__plugin_meta__ = PluginMetadata(
    name="jianerbot-plugin-example",  # 必须以 jianerbot-plugin- 开头
    description="插件描述",
    usage="使用说明（支持 {reminder} 占位符）",
    requires={"jianerbot-plugin-alconna"},  # 依赖的其他插件
)
```

### 插件 ID 规则

- 必须使用 `jianerbot-plugin-{name}` 格式
- `{name}` 使用小写字母和连字符
- 例如：`jianerbot-plugin-hello-world`

## 命令处理

### 基础命令

```python
from jianer.plugins.builtin.alconna import Command

@Command("ping").handle()
async def ping_handler(event, actions):
    # 处理命令
    return True  # 返回 True 阻止后续命令执行
```

### 带参数命令

```python
from arclet.alconna import Alconna, Args
from jianer.plugins.builtin.alconna import Command

_command = Alconna(
    "查歌",
    Args["song_name", str],
)

@Command(_command).handle()
async def search_song(event, actions, song_name: str):
    # song_name 会自动从命令中提取
    await actions.send(
        group_id=event.group_id,
        message=Manager.Message(Segments.Text(f"正在搜索：{song_name}"))
    )
    return True
```

### 多个命令

```python
@Command("帮助").handle()
@Command("help").handle()
async def help_handler(event, actions):
    # 同一个处理器可以处理多个命令
    return True
```

## 访问项目上下文

### 获取运行时状态

```python
from bot import plugin_state

runtime = plugin_state.get_runtime()
reminder = runtime.get("reminder", "")
bot_name = runtime.get("bot_name", "")
admins = runtime.get("admins", [])
root_users = runtime.get("root_users", [])
```

### 可用运行时字段

| 字段 | 说明 |
| --- | --- |
| `reminder` | 命令前缀 |
| `bot_name` / `bot_name_en` | 机器人名称 |
| `admins` | 管理员列表（含飞书绑定） |
| `supers` | 超级用户列表 |
| `root_users` | 根用户列表 |
| `cooldowns` | ACG 生图冷却表 |
| `cooldowns1` | Pixiv 生图冷却表 |
| `generating` | Pixiv 生图状态 |

### 获取 WebSocket URL

```python
ws_url = plugin_state.websocket_url()
```

## 发送消息

### 基础消息

```python
from jianer import common as Manager, segments as Segments

await actions.send(
    group_id=event.group_id,
    message=Manager.Message(Segments.Text("Hello"))
)
```

### 常用消息段

```python
# 文本
Segments.Text("文本内容")

# 图片
Segments.Image("file:///D:/path/image.png")

# @ 某人
Segments.At(user_id)

# 回复消息
Segments.Reply(message_id)

# 组合消息
Manager.Message(
    Segments.Reply(event.message_id),
    Segments.Text("回复内容")
)
```

### 使用 UniMessage

```python
from jianer.plugins.builtin.alconna import UniMessage, Target

await UniMessage.send(
    UniMessage.text("Hello"),
    target=Target.group(event.group_id),
    actions=actions,
)
```

## 事件处理

### 消息事件

```python
@Command("test").handle()
async def test_handler(event, actions):
    # event 包含消息信息
    user_id = event.user_id
    group_id = getattr(event, "group_id", None)
    message = event.message
    msg_str = getattr(event, "msg_str", str(message))
    
    # 判断是否为群聊
    if group_id is not None:
        # 群聊消息
        pass
    else:
        # 私聊消息
        pass
```

### 订阅框架事件

```python
from jianer import events

async def on_listener_start(event, actions):
    # 监听器启动时触发
    logger = plugin_state.get_logger()
    if logger:
        logger.info("插件已加载")

# 在插件加载时注册
def setup():
    client = plugin_state.get_plugin_client()
    if client:
        client.subscribe(events.HyperListenerStartNotify, on_listener_start)
```

## 权限检查

### 检查管理员

```python
@Command("管理命令").handle()
async def admin_command(event, actions):
    runtime = plugin_state.get_runtime()
    admins = runtime.get("admins", [])
    
    if str(event.user_id) not in admins:
        await actions.send(
            group_id=event.group_id,
            message=Manager.Message(Segments.Text("权限不足"))
        )
        return True
    
    # 执行管理操作
```

### 检查超级用户

```python
runtime = plugin_state.get_runtime()
supers = runtime.get("supers", [])

if str(event.user_id) in supers:
    # 超级用户操作
    pass
```

## 生命周期

### 插件关闭

```python
async def shutdown():
    # 清理资源
    logger = plugin_state.get_logger()
    if logger:
        logger.info("插件正在关闭")

# 插件自动调用 shutdown
```

### 热重载

插件热重载时：
1. 完整加载候选 generation
2. 原子交换新旧实例
3. 关闭旧 generation
4. 重放 listener-start 生命周期

## 注册 Agent 工具

### 基础工具注册

```python
from bot import plugin_state

def register_tools():
    jianer_ai = plugin_state.get_plugin_module("jianerbot-plugin-jianer-ai")
    if jianer_ai is None:
        return None
    
    from jianer.plugins.toolspec import ToolSpec, ToolRisk
    
    tool_spec = ToolSpec(
        name="my_tool",
        description="工具描述",
        risk=ToolRisk.READONLY,
        operations={
            "do_something": {
                "description": "操作描述",
                "parameters": {
                    "param1": {"type": "string", "description": "参数描述"}
                },
                "handler": my_tool_handler,
            }
        }
    )
    
    return jianer_ai.register_tool(tool_spec)

async def my_tool_handler(operation: str, **params):
    # 实现工具逻辑
    return {"result": "success"}

# 在插件加载时注册
_tool_token = register_tools()

# 在插件关闭时注销
async def shutdown():
    if _tool_token:
        jianer_ai = plugin_state.get_plugin_module("jianerbot-plugin-jianer-ai")
        if jianer_ai:
            jianer_ai.unregister_tool(_tool_token)
```

## 完整示例

```python
from jianer.plugins import PluginMetadata
from jianer.plugins.builtin.alconna import Command, UniMessage, Target
from jianer import common as Manager, segments as Segments
from bot import plugin_state

__plugin_meta__ = PluginMetadata(
    name="jianerbot-plugin-example",
    description="示例插件",
    usage="{reminder}示例 [参数] —> 执行示例命令",
    requires={"jianerbot-plugin-alconna"},
)

@Command("示例").handle()
@Command("示例 <text>").handle()
async def example_handler(event, actions, text: str = ""):
    runtime = plugin_state.get_runtime()
    bot_name = runtime.get("bot_name", "机器人")
    admins = runtime.get("admins", [])
    
    # 权限检查
    if str(event.user_id) not in admins:
        await UniMessage.send(
            UniMessage.text(f"{bot_name}：权限不足"),
            target=Target.from_event(event),
            actions=actions,
        )
        return True
    
    # 执行操作
    response = f"收到参数：{text or '（无）'}"
    
    await actions.send(
        group_id=getattr(event, "group_id", None),
        user_id=getattr(event, "user_id", None),
        message=Manager.Message(Segments.Text(response))
    )
    
    return True

async def shutdown():
    logger = plugin_state.get_logger()
    if logger:
        logger.info("示例插件正在关闭")
```

## 调试技巧

### 使用日志

```python
logger = plugin_state.get_logger()
if logger:
    logger.debug("调试信息")
    logger.info("普通信息")
    logger.warning("警告信息")
    logger.error("错误信息")
```

### 查看插件状态

发送 `~插件视角` 查看：
- 已加载插件列表
- 已禁用插件
- 加载失败的插件
- 加载警告

### 热重载测试

修改插件后发送 `~重载插件` 即可立即生效，无需重启简儿。

更多信息请参考项目的 `Variables.md` 和 `plugins/` 目录下的现有插件。
