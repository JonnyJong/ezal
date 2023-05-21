# Ezal
简单的博客框架。

[English](https://github.com/JonnyJong/ezal/blob/main/readme.md)

## 待办事项
- [x] Markdown 渲染器
- [ ] 插件系统
  - [ ] 支持 Typescript
- [ ] 重做分类功能
- [ ] 改进服务器模式
- [ ] 改进构建过程
- [x] 主题支持
- [ ] 文档

## 使用
安装 Ezal。
```bash
npm init
npm install --save ezal
```

添加到 `package.json`。
```json package.json
{
  "scripts": {
    "init": "node ./node_modules/ezal/dist/main.js init",
    "build": "node ./node_modules/ezal/dist/main.js",
    "serve": "node ./node_modules/ezal/dist/main.js serve",
    "clean": "node ./node_modules/ezal/dist/main.js clean"
  }
}
```

初始化项目。
```bash
npm run init
```

完成。

## 构建
```bash
npm install
npm install -g typescript
tsc
```

## 运行
```bash
npm run serve
```

## 清理
```bash
npm run clean
```
