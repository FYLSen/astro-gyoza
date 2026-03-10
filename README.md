# Gyoza-Lucide

Gyoza-Lucide is a static blog template built with Astro and React.

![astro version](https://img.shields.io/badge/astro-5.18.0-yellow)
![node version](https://img.shields.io/badge/node-20.x-green)

Demo Site:

- [gyoza.fylsen.com](https://gyoza.fylsen.com)
- [fylsen.com](https://fylsen.com)

Enjoy it!

## 📷 Screenshots

![Preview](https://s2.loli.net/2024/05/06/A9rzC3Uym7RwdQc.webp)

## 🎉 Features

- ✅ 有着规范的 URL 和 OpenGraph 信息，对 SEO 友好
- ✅ 支持站点地图
- ✅ 支持 RSS 订阅
- ✅ 支持夜间模式
- ✅ 特殊日期变灰
- ✅ 简单干净的配色和主题
- ✅ 支持评论系统
- ✅ 支持代码高亮

## 🔧 Tech Stack

- [Astro 5](https://astro.build/)
- [React 19](https://reactjs.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Jotai](https://jotai.org/)
- [Lucide](https://lucide.dev/)

## 📖 Documentation

前往：[Documentation](https://gyoza.fylsen.com/posts/guide)

## 🚀 Project Structure

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   ├── pages/
│   ├── plugins/
│   ├── store/
│   ├── styles/
│   ├── utils/
│   └── config.json
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

网站配置保存在 `src/config.json` 文件。

## 🧞 Commands

| Command        | Action                                       |
| :------------- | :------------------------------------------- |
| `pnpm i`       | Installs dependencies                        |
| `pnpm dev`     | Starts local dev server at `localhost:4321`  |
| `pnpm build`   | Build your production site to `./dist/`      |
| `pnpm preview` | Preview your build locally, before deploying |
| `pnpm lint`    | Format code using Prettier                   |

## Algolia 爬取脚本

为了更好的使用 Algolia，需要将爬取脚本在 Algolia 管理端进行配置，脚本案例在 `script/algolia.js`，注意修改为自己的域名。
