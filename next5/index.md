---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "简儿"
  text: "NEXT 5"
  tagline: 开源 · 模块化 · 生产级 —— 基于 JianerCore 的新一代 QQ 群机器人
  image:
    src: /tx.png
    alt: 简儿 QQ 机器人
  actions:
    - theme: brand
      text: 🚀 快速开始
      link: /next5/quickstart
    - theme: alt
      text: 📖 部署指南
      link: /next5/deployment
    - theme: alt
      text: GitHub
      link: https://github.com/SRInternet-Studio/Jianer_QQ_bot

features:
  - icon: 🤖
    title: 多模型 AI 对话与 Agent
    details: 原生支持 DeepSeek、Gemini、ChatGPT、Claude 等主流模型。内置工具调用、网页搜索、GitHub 仓库读取、状态化网页浏览器和天气查询，支持独立内容审核与回复后记忆审查。
    link: /next5/jianer-ai
    linkText: 了解 JianerAI →
  - icon: 🧠
    title: 长期记忆系统
    details: 按人设和会话隔离的规范化 SQLite 存储，支持个人记忆、群记忆、对话片段和证据摘要。后台异步记忆审查，不阻塞用户交互。
    link: /next5/memory
    linkText: 记忆架构 →
  - icon: 🎮
    title: 舞萌 DX 完整支持
    details: 移植 nonebot-plugin-maimaidx v3.0.13，支持水鱼与落雪查分器、OAuth 无回调绑定、B50/成绩/曲目/别名/猜歌/表格，并集成 JianerAI Agent 工具。
    link: /next5/maimaidx
    linkText: 舞萌功能 →
  - icon: 🔌
    title: 强大的插件系统
    details: 基于 JianerCore PluginManager，使用 PluginMetadata + Alconna Command 开发。支持热重载、启用/禁用管理、依赖声明和生命周期钩子。
    link: /next5/plugin-dev
    linkText: 开发插件 →
  - icon: 🛡️
    title: 生产级架构
    details: 多协议适配（OneBot/Milky/飞书/Kritor）、插件沙箱隔离、原子化热重载、优雅关闭与完整的权限组管理。
    link: /next5/deployment
    linkText: 部署文档 →
  - icon: 🌐
    title: 多平台协议支持
    details: 支持 LLBot（Milky/OneBot 11）、NapCatQQ（OneBot 11）等协议实现端，支持飞书长连接。适配 Windows、Linux 全平台部署。
    link: /next5/protocols
    linkText: 协议配置 →
---
