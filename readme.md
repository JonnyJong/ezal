# Ezal
Simple blog framework.

[简体中文](https://github.com/JonnyJong/ezal/blob/main/readme.zh.md)

## Todo
- [x] Markdown Renderer
- [ ] Plugin System
  - [ ] Typescript support
- [ ] Remake category function
- [ ] Improve server mode
- [ ] Improve build process
- [x] Theme support
- [ ] Document

## Use
Install Ezal.
```bash
npm init
npm install --save ezal
```

Add in `package.json`.
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

Init the project.
```bash
npm run init
```

Done.

## Build
```bash
npm install
npm install -g typescript
tsc
```

## Run
```bash
npm run serve
```

## Clean
```bash
npm run clean
```
