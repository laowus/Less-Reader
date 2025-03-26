## FAQ - 常见问题

### 一、开发环境相关

> `npm install`或`npm run dist`时，发生错误

【常见原因】  
国内网络环境不稳定，连接国外服务器容易超时  
一般都是因为无法下载 Electron、Electron Builder 而失败

【解决方式】  
在项目根目录下新增.npmrc 配置文件，内容如下（配置国内阿里镜像）：

```
registry=http://registry.npmmirror.com
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
```

（ 其实，将项目中的 npmrc 文件直接重命名为.npmrc 即可 ）

> 常用命令

1、设置 registry 下载源

```
npm config set registry http://registry.npmmirror.com
```

2、恢复默认下载源命令

```
npm config delete registry
```

3、配置查看命令

```
npm config ls  或  npm config list
```

4、检查（诊断）命令

```
npm doctor
```

5、安装命令（显示详细信息）

```
npm install --verbose
```

6、更新命令（依赖更新）

```
npm update
```
