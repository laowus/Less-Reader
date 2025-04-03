const { app, BrowserWindow, ipcMain, Menu, shell, Tray, } = require('electron')
const { isWinOS, isDevEnv, APP_ICON } = require('./env')
const path = require('path')
const Store = require("electron-store");
const store = new Store();
const { initDatabase } = require('./dbTool')

let resourcesRoot = path.resolve(app.getAppPath());
let publicRoot = path.join(__dirname, '../../public')

if (!isDevEnv) {
    resourcesRoot = path.dirname(resourcesRoot);
    publicRoot = path.join(__dirname, '../../dist')
}
//ipc处理
const fileHandle = require('./ipcHandlers/fileHandle');
const dbHandle = require('./ipcHandlers/dbHandle');
const { transcode } = require('buffer');
// 用于存储所有的 readerWindow 实例
let readerWindows = [];

fileHandle();
dbHandle();

let mainWin = null, readerWindow, tray = null
let options = {
    width: 1050,
    height: 660,
    frame: false,
    transparent: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
    },
};
let readerOptions = {
    width: 1050,
    height: 660,
    frame: false,
    transparent: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
    },
};
const appWidth = 1020, appHeight = 768
/* 自定义函数 */
const startup = () => {
    init()
    registryGlobalListeners()
}

const init = () => {
    app.whenReady().then(async () => {
        try {
            await initDatabase();
            mainWin = createWindow();
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    })

    app.on('activate', (event) => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWin = createWindow()
        }
    })

    app.on('window-all-closed', (event) => {
        if (!isDevEnv) {
            app.quit()
        }
    })

    app.on('before-quit', (event) => {
        sendToRenderer('app-quit')
    })
}

ipcMain.on('window-min', event => {
    const webContent = event.sender;
    const win = BrowserWindow.fromWebContents(webContent);
    win.hide();
});
ipcMain.on('window-max', event => {
    const webContent = event.sender;
    const win = BrowserWindow.fromWebContents(webContent);
    win.maximize();
});
ipcMain.on('window-close', event => {
    const webContent = event.sender;
    const win = BrowserWindow.fromWebContents(webContent);
    win.hide();
});
//gei Home 窗口传递 更新
ipcMain.on('home-set-theme', (event, isUpdate) => {
    console.log(isUpdate);
    if (mainWin) {
        mainWin.webContents.send('home-set-theme-response', isUpdate);
    }
})

//全局事件监听
const registryGlobalListeners = () => {
    //主进程事件监听
    ipcMain.on('app-quit', () => {
        app.quit()
    }).on('app-min', () => {
        if (mainWin.isFullScreen()) mainWin.setFullScreen(false)
        if (mainWin.isMaximized() || mainWin.isNormal()) mainWin.minimize()
    }).on('app-max', () => {
        let isFullScreen = false
        if (isWinOS) {
            isFullScreen = toggleWinOSFullScreen()
        } else {
            isFullScreen = !mainWin.isFullScreen()
            mainWin.setFullScreen(isFullScreen)
        }
        sendToRenderer('app-max', isFullScreen)
    }).on('app-zoom', (e, value) => {
        setAppWindowZoom(value)
    }).on('app-zoom-noResize', (e, value) => {
        setAppWindowZoom(value, true)
    })
}
// 动态生成上下文菜单
const generateContextMenu = () => {
    return Menu.buildFromTemplate([
        {
            label: '打开主界面',
            icon: path.join(publicRoot, '/images/app.png'),
            click: () => {
                mainWin.show();
            },
        },
        {
            label: '正在阅读',
            icon: path.join(publicRoot, '/images/app.png'),
            submenu: readerWindows.length > 0 ? readerWindows.map((readerItem, index) => {
                return {
                    label: `${readerItem.name}`,
                    click: () => {
                        if (!readerItem.window.isDestroyed()) {
                            readerItem.window.show();
                        }
                    }
                };
            }) : [
                {
                    label: '暂无阅读窗口',
                    enabled: false
                }
            ]
        },
        {
            label: '退出',
            icon: path.join(publicRoot, '/images/quit.png'),
            click: function () {
                app.quit();
            },
        },
    ]);
};

// 更新上下文菜单
const updateContextMenu = () => {
    if (tray) {
        const contextMenu = generateContextMenu();
        tray.setContextMenu(contextMenu);
    }
};

//创建浏览窗口
const createWindow = () => {
    const mainWindow = new BrowserWindow(options);
    if (isDevEnv) {
        mainWindow.loadURL("http://localhost:7000/")
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile('dist/index.html')
    }

    tray = new Tray(path.join(publicRoot, '/images/logo.png'));
    tray.setToolTip('Less-Reader');

    let contextMenu = generateContextMenu();
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        mainWindow.show();
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
    return mainWindow
}

const sendToRenderer = (channel, args) => {
    try {
        if (mainWin) mainWin.webContents.send(channel, args)
    } catch (error) {
    }
}

const toggleWinOSFullScreen = () => {
    if (!isWinOS) return null
    const isMax = mainWin.isMaximized()
    if (isMax) {
        mainWin.unmaximize()
    } else {
        mainWin.maximize()
    }
    return !isMax
}

const setAppWindowZoom = (value, noResize) => {
    const zoom = Number(value || 100)
    const zoomFactor = parseFloat(zoom / 100)
    const width = parseInt(appWidth * zoomFactor)
    const height = parseInt(appHeight * zoomFactor)
    mainWin.webContents.setZoomFactor(zoomFactor)
    if (noResize) return
    mainWin.setMinimumSize(width, height)
    if (mainWin.isNormal()) {
        mainWin.setSize(width, height)
        mainWin.center()
    }
}


//记录当前窗口 
ipcMain.on("open-book", (event, config) => {
    let { url, name, bookid } = config;
    const isExist = readerWindows.find(item => item.bookid === bookid);
    if (isExist) {
        const targetWindow = readerWindows.find(item => item.bookid === bookid);
        targetWindow.window.show();
    } else {
        readerOptions.webPreferences.nodeIntegrationInSubFrames = true;
        store.set({ url });
        const newReaderWindow = new BrowserWindow({
            ...readerOptions,
            width: parseInt(store.get("windowWidth") || 1050),
            height: parseInt(store.get("windowHeight") || 660),
            x: parseInt(store.get("windowX")),
            y: parseInt(store.get("windowY"))
        });
        if (isDevEnv) {
            newReaderWindow.webContents.openDevTools();
        }
        newReaderWindow.loadURL(url);

        // 监听窗口大小改变事件
        newReaderWindow.on("resize", () => {
            if (!newReaderWindow.isDestroyed()) {
                let bounds = newReaderWindow.getBounds();
                store.set({
                    windowWidth: bounds.width,
                    windowHeight: bounds.height,
                    windowX: bounds.x,
                    windowY: bounds.y,
                });
            }
        });
        // 监听窗口关闭事件
        newReaderWindow.on("close", (event) => {
            if (!newReaderWindow.isDestroyed()) {
                let bounds = newReaderWindow.getBounds();
                store.set({
                    windowWidth: bounds.width,
                    windowHeight: bounds.height,
                    windowX: bounds.x,
                    windowY: bounds.y,
                });
                // 从数组中移除关闭的窗口
                readerWindows = readerWindows.filter((item) => item.window !== newReaderWindow);
                // 更新上下文菜单
                updateContextMenu();
            }
        });

        // 将新的 readerWindow 添加到数组中
        const newObj = {
            name,
            bookid,
            window: newReaderWindow
        }
        readerWindows.push(newObj);
        // 更新上下文菜单
        updateContextMenu();
    }

});
//关闭阅读的窗口
ipcMain.on('close-reader-window', (event, bookid) => {
    const targetWindow = readerWindows.find(item => item.bookid === bookid);
    if (targetWindow && !targetWindow.window.isDestroyed()) {
        targetWindow.window.close();
        readerWindows = readerWindows.filter(item => item.bookid !== targetWindow.bookid);
        updateContextMenu();
    }
});



//启动应用
startup()

