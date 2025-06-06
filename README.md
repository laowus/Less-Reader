# <div align='center'><img src="https://github.com/laowus/Less-Reader/blob/main/public/icon.png" width="100" height="100"><br/>简阅 Less Reader</div>

一款基于 Electron + Vue 3 开发的电子书阅读器。

支持格式: EPUB、MOBI、AZW3、FB2、PDF、TXT

### 联系:

有兴趣可以加入 QQ 群：616712461 (备注：Less Reader)
或者本人 QQ:37156760 (备注：Less Reader) 交流共同进步

### 开发/测试环境

- Windows 10( 个人电脑只有 Windows 系统的,linux 苹果系统没有测试)
- IDE：[Visual Studio Code](https://code.visualstudio.com/)
- [Nodejs](https://nodejs.org/)：v20.18.0(只是我电脑上的版本,其他版本可能也没关系)
- 其他：详见 [package.json](package.json)

### 功能特性

- 支持主流电子书格式：EPUB、MOBI、AZW3、FB2、PDF、TXT
- 解析文件的来自开源软件: [foliate-js](https://github.com/foliate/foliate-js)
- 完美解析，确保最佳阅读体验，界面设计来源: [readest](https://github.com/readest/readest)
- 功能参考:

  [koodo-reader](https://github.com/koodo-reader/koodo-reader)
  语言框架: Electron + React + Typescript

  [anx-reader](https://github.com/Anxcye/anx-reader)
  语言框架 : FLutter

- TTS 朗读功能, 使用 Web Speech API 实现, 可惜只有三种语音,而且都是女生,区别不大。但是免费
  可以选择声音，语速等。
- 使用 sqlite 用作数据保存。
  （Windows 环境）数据保存位置：C:\Users\*用户名*\AppData\Roaming\less-reader
  注：*用户名\* 为你的电脑用户名

### 预览图

![Github snap 1.png](https://github.com/laowus/Less-Reader/blob/main/snapshot/1.png)
![Github snap 2.png](https://github.com/laowus/Less-Reader/blob/main/snapshot/2.png)
![Github snap 3.png](https://github.com/laowus/Less-Reader/blob/main/snapshot/3.png)
![Github snap 4.png](https://github.com/laowus/Less-Reader/blob/main/snapshot/4.png)
![Github snap 5.png](https://github.com/laowus/Less-Reader/blob/main/snapshot/5.png)
![Github snap 6.png](https://github.com/laowus/Less-Reader/blob/main/snapshot/6.png)
![Github snap 7.png](https://github.com/laowus/Less-Reader/blob/main/snapshot/7.png)
![Github snap 8.png](https://github.com/laowus/Less-Reader/blob/main/snapshot/8.png)

### TODO

- [x] 记住每个阅读窗口的大小，记住每个阅读窗口的位置，下次调用这个窗口和位置。
- [x] 托盘里面显示多个阅读窗口，点击后显示对应的阅读窗口。
      ![Github snap 8.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/8.jpg)
- [x] 支持 TTS 朗读 调用系统（Web Speech API）这里只测试了 Windows10 系统。
      注： 1. 可以选择声音，语速等。只有三种声音,而且都是女生,区别不大。 <br>2. 免费
      ![Github snap 5.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/9.jpg)
- [x] 自定义字体颜色和背景，自己安装好字体在电脑里面，这样可以选择字体。
      默认 9 种主题。可以删除，也可恢复。<br>
      ![Github snap 10.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/10.jpg)
      自定义主题。<br>
      ![Github snap 11.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/11.jpg)
- [x] v.0.0.3 <br>升级了 electron 版本，最新版本, 由于新版本不支持在渲染进程获取文件 File 对象的 path(文件路径),
      所以在主进程打开选择文件,然后把文件信息传递给渲染进程,再进行文件其他操作。
- [x] v.0.0.3 <br> 添加了 license 协议
- [x] v.0.0.4<br>
      1、优化书籍目录展开和收起。添加了箭头，显示更清楚。<br>
      ![Github snap 12.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/12.jpg)<br>
      2、去除窗口圆角。（同背景色的窗口无法区分，所以去掉了）<br>
      ![Github snap 13.jpg](https://github.com/laowus/Less-Reader/blob/main/snapshot/13.jpg)
- [x] v.0.0.5<br>
      1、增加读取 txt 文件: 把 txt 文件转成 epub,再读入<br>
- [x] v.0.0.6<br>
      1、增加读取 pdf 文件
- [x] v.0.0.8

- ```
  1、添加单列和两列切换<br>
  ```

### For 开发者

- 请先下载安装最新版（或最新 LTS 版本） [Nodejs](https://nodejs.org/)
- <b>如有问题，建议先查看文档</b>：[FAQ.md](FAQ.md)
- <b>安装依赖</b>
  `npm install`
- <b>开发模式运行</b>
  `npm run dev`
- <b>构建打包</b>
  `npm run dist`
  或者，分步执行
  `npm run build`
  `npm run pack`
- <b>更新依赖</b>
  `npm update`
