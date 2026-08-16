# 用户组与权限

简儿 NEXT 5 提供三级权限组管理，用于控制不同用户的操作权限。

## 权限组概览

| 权限组 | 配置方式 | 权限范围 | 可修改 |
| --- | --- | --- | --- |
| ROOT_User | `config.json` | 完全控制 | 否（只读） |
| Super_User | `Super_User.ini` | 管理功能 | 是 |
| Manage_User | `Manage_User.ini` | 基础管理 | 是 |

## ROOT_User（根用户）

### 配置方式

在 `config.json` 中：

```json
{
  "others": {
    "ROOT_User": ["123456789"]
  }
}
```

### 权限

- ✅ 所有 Super_User 权限
- ✅ 所有 Manage_User 权限
- ✅ 查看所有管理操作的审计日志
- ✅ 不可被其他用户修改权限

::: warning 重要
ROOT_User 只能通过修改 `config.json` 来变更，运行时无法添加或删除。请至少配置一个根用户。
:::

## Super_User（超级用户）

### 配置文件

`Super_User.ini`（UTF-8 编码）：

```ini
123456789
987654321
```

### 权限

**所有 Manage_User 权限，以及：**

- ✅ 管理用户权限
- ✅ 退出群聊
- ✅ 分配头衔

## Manage_User（管理用户）

### 配置文件

`Manage_User.ini`（UTF-8 编码）：

```ini
111111111
222222222
```

### 权限

- ✅ 查看运行状态
- ✅ 休眠机器人
- ✅ 重启机器人
- ✅ 插件管理
- ✅ 群发消息
- ✅ 群成员管理
- ✅ 消息撤回

详细权限列表请参考项目文档。
