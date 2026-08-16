import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Jianer Docs",
  description: "开源 · 模块化 · 易于配置 —— 基于 OneBot v11 的新一代 QQ 群机器人",
  lastUpdated: true,
  base: '/',
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/tx.png' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: '简儿 QQ 机器人文档' }],
    ['meta', { name: 'og:description', content: '开源 · 模块化 · 易于配置 —— 新一代 QQ 群机器人' }],
  ],
  themeConfig: {
    logo: '/tx.png',
    siteTitle: '简儿 文档',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },
    nav: [
      { text: '首页', link: '/' },
      { 
        text: 'NEXT 5 🆕', 
        items: [
          { text: '🚀 快速开始', link: '/next5/quickstart' },
          { text: '📦 部署指南', link: '/next5/deployment' },
          { text: '🤖 JianerAI', link: '/next5/jianer-ai' },
          { text: '🎮 舞萌 DX', link: '/next5/maimaidx' },
          { text: '🔌 插件开发', link: '/next5/plugin-dev' },
        ]
      },
      { text: 'NEXT 3 快速开始', link: '/faststart' },
      {
        text: 'NEXT 3 使用指南',
        items: [
          { text: '日常使用指南', link: '/guide/daily-use' },
          { text: 'WebUI 使用指南', link: '/guide/webui' },
          { text: '配置 AI 功能', link: '/Configuring-AI-Functions' },
          { text: '配置用户组', link: '/Configure-User-Group' },
          { text: 'NapCatQQ 教程', link: '/NapCatQQ使用教程' },
        ]
      },
      {
        text: '开发',
        items: [
          { text: 'NEXT 5 插件开发', link: '/next5/plugin-dev' },
          { text: 'NEXT 3 插件开发', link: '/Create-a-New-Plugin' },
          { text: 'API 参考', link: '/api-reference' },
        ]
      },
      { text: '问题排查', link: '/简儿问题&解决方法汇总' },
    ],
    editLink: {
      pattern: 'https://github.com/SRInternet-Studio/Jianer_QQ_Bot-docs/edit/main/:path',
      text: '在 GitHub 上编辑此页'
    },
    sidebar: {
      '/next5/': [
        {
          text: '简儿 NEXT 5',
          items: [
            { text: '🏠 概览', link: '/next5/index' },
            { text: '🚀 快速开始', link: '/next5/quickstart' },
            { text: '📦 部署指南', link: '/next5/deployment' },
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '🤖 JianerAI', link: '/next5/jianer-ai' },
            { text: '🧠 长期记忆系统', link: '/next5/memory' },
            { text: '🎮 舞萌 DX', link: '/next5/maimaidx' },
          ]
        },
        {
          text: '配置与管理',
          items: [
            { text: '🌐 协议配置', link: '/next5/protocols' },
            { text: '👥 用户组与权限', link: '/next5/user-groups' },
          ]
        },
        {
          text: '开发者',
          items: [
            { text: '🔌 插件开发指南', link: '/next5/plugin-dev' },
          ]
        },
      ],
      '/': [
        {
          text: '简儿 NEXT 5 🆕',
          collapsed: true,
          items: [
            { text: '🏠 NEXT 5 概览', link: '/next5/index' },
            { text: '🚀 快速开始', link: '/next5/quickstart' },
            { text: '📦 部署指南', link: '/next5/deployment' },
            { text: '🤖 JianerAI', link: '/next5/jianer-ai' },
            { text: '🎮 舞萌 DX', link: '/next5/maimaidx' },
            { text: '🔌 插件开发', link: '/next5/plugin-dev' },
          ]
        },
        {
          text: 'NEXT 3 部署教程',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/faststart' },
            { text: '① 下载简儿', link: '/guide/download' },
            { text: '② 安装运行环境', link: '/guide/install-deps' },
            { text: '③ 配置你的机器人', link: '/guide/configure' },
            { text: '④ 启动并使用', link: '/guide/launch' },
          ]
        },
        {
          text: 'NEXT 3 使用指南',
          collapsed: false,
          items: [
            { text: '日常使用指南', link: '/guide/daily-use' },
            { text: 'WebUI 使用指南', link: '/guide/webui' },
            { text: 'NapCatQQ 使用教程', link: '/NapCatQQ使用教程' },
          ]
        },
        {
          text: 'NEXT 3 配置',
          collapsed: false,
          items: [
            { text: '配置 AI 功能', link: '/Configuring-AI-Functions' },
            { text: '配置用户组', link: '/Configure-User-Group' },
          ]
        },
        {
          text: '开发者',
          collapsed: false,
          items: [
            { text: 'NEXT 3 插件开发', link: '/Create-a-New-Plugin' },
            { text: 'API 参考', link: '/api-reference' },
          ]
        },
        {
          text: '其它',
          collapsed: false,
          items: [
            { text: '问题与解决方法汇总', link: '/简儿问题&解决方法汇总' },
          ]
        },
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/SRInternet-Studio/Jianer_QQ_bot/' }
    ],
    footer: {
      message: '基于 <a href="https://github.com/SRInternet-Studio/Jianer_QQ_bot/blob/main/LICENSE">MIT 协议</a> 开源 | 框架 <a href="https://github.com/HarcicYang/HypeR_Bot">HypeR_Bot</a> 由 <a href="https://github.com/HarcicYang">@HarcicYang</a> 开发',
      copyright: 'Copyright © 2024-present <a href="https://github.com/SRInternet-Studio">思锐工作室 SRInternet Studio</a>'
    },
    outline: {
      level: [2, 3],
      label: '页面导航'
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
  }
})
