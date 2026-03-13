# Diet Planner Frontend

基于 Vue 3 + Vite 的饮食规划前端项目，提供用户端与管理员端页面，用于饮食分析、图谱探索、菜谱推荐、购物清单和反馈管理。

## 技术栈

- Vue 3
- Vue Router 4
- Axios
- Vite 5

## 目录结构

```text
frontend/
  src/
    api/            # 接口请求封装
    components/     # 通用组件（布局、侧边栏、头部）
    views/          # 页面视图
    router/         # 路由与守卫
  index.html
  vite.config.js
  package.json
```

## 运行环境

- Node.js 18+（推荐）
- npm 9+（推荐）

## 安装与启动

```bash
npm install
npm run dev
```

默认开发地址：`http://localhost:5173`

## 构建与预览

```bash
npm run build
npm run preview
```

## 核心路由

- `/login` 登录页
- `/user/diet` 饮食分析
- `/user/graph` 图谱探索
- `/user/recipe` 菜谱推荐
- `/user/shop` 购物清单
- `/user/feedback` 反馈管理
- `/user/profile` 用户信息
- `/admin` 管理员面板

说明：路由守卫会根据 `localStorage` 中的 `token` 与 `role` 自动跳转。

## 后端接口配置

当前默认后端地址在 `src/api/client.js` 中：

```js
baseURL: 'http://localhost:8081/api'
```

如果后端地址变更，请修改该配置。

## 管理员能力（前端入口已提供）

- 用户列表与角色管理
- 数据导入与统计
- 训练任务触发与进度查询
- 向量生成与模型重载

## 注意事项

- 项目根目录包含历史 SVN 元数据目录（`.svn/`）和大文件目录，已通过 `.gitignore` 进行忽略。
- 提交代码前建议执行 `npm run build` 验证构建是否通过。
