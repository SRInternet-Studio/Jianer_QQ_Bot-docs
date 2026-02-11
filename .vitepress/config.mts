import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-

export default defineConfig({
  title: "Jianer Docs",
  description: "开源 · 模块化 · 易于配置",
  lastUpdated: true,
  base: '/',
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-
    nav: [
      { text: 'Home', link: '/' },
    ],
    editLink: {
      pattern: 'https://github.com/SRInternet-Studio/Jianer_QQ_bot/wiki/:path/_edit'
    },
    sidebar: [
      {
        text: 'Home',
        items: [
          { text: '快速开始', link: '/faststart' },
          { text: '用户组', link: '/Configure-User-Group' },
          { text: '使用AI功能', link: '/Configuring-AI-Functions' },
          { text: '开发你的插件', link: '/Create-a-New-Plugin' },
          { text: 'NapCatQQ使用教程', link: '/NapCatQQ使用教程' },
          { text: '问题与解决方法汇总', link: '/简儿问题&解决方法汇总' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/SRInternet-Studio/Jianer_QQ_bot/' }
    ]      
  }
})
