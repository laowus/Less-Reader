const { app, BrowserWindow, ipcMain, Menu, shell, Tray, } = require('electron')
const { isWinOS, isDevEnv, APP_ICON } = require('./env')
const fs = require('fs');
const path = require('path')
const Store = require("electron-store");
const store = new Store();

const configDir = app.getPath("userData");
const dirPath = path.join(configDir, "uploads");

let FOLDER_PATH = path.join(__dirname, '../../books');
let resourcesRoot = path.resolve(app.getAppPath());
let publicRoot = path.join(__dirname, '../../public')

if (!isDevEnv) {
    resourcesRoot = path.dirname(resourcesRoot);
    FOLDER_PATH = path.join(resourcesRoot, "/books")
    publicRoot = path.join(__dirname, '../../dist')
}

let mainWin = null, readerWindow, tray = null
let options = {
    width: 1050,
    height: 660,
    frame: false,
    backgroundColor: '#fff',
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
    app.whenReady().then(() => {
        mainWin = createWindow()
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

//创建浏览窗口
const createWindow = () => {

    const mainWindow = new BrowserWindow(options);

    if (isDevEnv) {
        mainWindow.loadURL("http://localhost:7000/")
    } else {
        mainWindow.loadFile('dist/index.html')
    }
    mainWindow.webContents.openDevTools();
    tray = new Tray(path.join(publicRoot, '/images/logo.png'));
    tray.setToolTip('Less-Reader');
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '打开主界面',
            icon: path.join(publicRoot, '/images/app.png'),
            click: () => {
                mainWindow.show();
            },
        },
        {
            label: '退出',
            icon: path.join(publicRoot, '/images/quit.png'),
            click: function () {
                app.quit();
            },
        },
    ])
    tray.setContextMenu(contextMenu);
    //监听托盘双击事件
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


ipcMain.on("user-data", (event, arg) => {
    event.returnValue = dirPath;
})

ipcMain.on("storage-location", (event, arg) => {
    event.returnValue = path.join(dirPath, "data");//获取
});

ipcMain.handle("open-book", (event, config) => {
    let { url } = config;
    console.log(url)
    options.webPreferences.nodeIntegrationInSubFrames = true;
    store.set({ url });
    readerWindow = new BrowserWindow({
        ...options,
        width: parseInt(store.get("windowWidth") || 1050),
        height: parseInt(store.get("windowHeight") || 660),
        x: parseInt(store.get("windowX")),
        y: parseInt(store.get("windowY"))
    });
    readerWindow.webContents.openDevTools();

    readerWindow.loadURL(url);
    readerWindow.on("close", (event) => {
        if (!readerWindow.isDestroyed()) {
            let bounds = readerWindow.getBounds();
            store.set({
                windowWidth: bounds.width,
                windowHeight: bounds.height,
                windowX: bounds.x,
                windowY: bounds.y,
            });
        }
    });
    event.returnValue = "success";
});



//启动应用
startup()

