# <div align='center'><img src="https://github.com/laowus/Less-Reader/blob/main/public/icon.png" width="100" height="100"><br/>简阅 Less Reader</div>

一款基于 Electron + Vue 3 开发的电子书阅读器。

支持格式: epub , mobi, azw3, (pdf, txt 暂不支持)

### 开发/测试环境

-   Windows 10( 个人电脑只有 Windows 系统的,linux 苹果系统没有测试)
-   IDE：[Visual Studio Code](https://code.visualstudio.com/)
-   [Nodejs](https://nodejs.org/)：v20.18.0(只是我电脑上的版本,其他版本可能也没关系)
-   其他：详见 [package.json](package.json)

### 功能特性

-   支持主流电子书格式：EPUB、MOBI、AZW3、FB2 ( PDF, TXT 暂不支持)
-   解析文件的来自开源软件: [foliate-js](https://github.com/foliate/foliate-js)
-   完美解析，确保最佳阅读体验，界面设计来源: [readest](https://github.com/readest/readest)
-   功能参考:

    [koodo-reader](https://github.com/koodo-reader/koodo-reader)
    语言框架: Electron + React + Typescript

    [anx-reader](https://github.com/Anxcye/anx-reader)
    语言框架 : FLutter

-   TTS 朗读功能, 使用 Web Speech API 实现, 可惜只有三种语音,而且都是女生,区别不大。但是免费
    可以选择声音，语速等。
-   使用 sqlite 用作数据保存。
    （Windows 环境）数据保存位置：C:\Users\*用户名*\AppData\Roaming\less-reader
    注：*用户名\* 为你的电脑用户名
-   因为 sqlite 要使用，编译测试要安装 先安装 vs2019 + python10+
    我在这里花了挺多时间, 现在已经成功了。
    可以参考：https://blog.csdn.net/qq_34907249/article/details/120254151

### 预览图

![Github snap 1.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/1.jpg)
![Github snap 2.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/2.jpg)
![Github snap 3.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/3.jpg)
![Github snap 4.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/4.jpg)
![Github snap 5.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/5.jpg)

### TODO

-   [x] 记住每个阅读窗口的大小，记住每个阅读窗口的位置，下次调用这个窗口和位置。
-   [x] 托盘里面显示多个阅读窗口，点击后显示对应的阅读窗口。
        ![Github snap 8.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/8.jpg)
-   [x] 支持 TTS 朗读 调用系统（Web Speech API）这里只测试了 Windows10 系统。
        注： 1. 可以选择声音，语速等。只有三种声音,而且都是女生,区别不大。 2. 免费
        ![Github snap 5.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/9.jpg)
-   [ ] 自定义字体颜色和背景，导入字体。

### For 开发者

-   请先下载安装最新版（或最新 LTS 版本） [Nodejs](https://nodejs.org/)

-   <b>如有问题，建议先查看文档</b>：[FAQ.md](FAQ.md)
-   <b>安装依赖</b>  
    `npm install`
-   <b>开发模式运行</b>  
    `npm run dev`
-   <b>构建打包</b>  
    `npm run dist`
    或者，分步执行  
    `npm run build`  
    `npm run pack`
-   <b>更新依赖</b>  
    `npm update`
