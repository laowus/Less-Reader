const { app, BrowserWindow, ipcMain, Menu, shell, Tray, dialog } = require('electron')
const { isWinOS, isDevEnv, APP_ICON } = require('./env')
const path = require('path')
const Store = require("electron-store");
const store = new Store();
const { initDatabase } = require('./dbTool')
const fs = require('fs');
let resourcesRoot = path.resolve(app.getAppPath());
let publicRoot = path.join(__dirname, '../../public')

if (!isDevEnv) {
    resourcesRoot = path.dirname(resourcesRoot);
    publicRoot = path.join(__dirname, '../../dist')
}
//ipc处理
const fileHandle = require('./ipcHandlers/fileHandle');
const dbHandle = require('./ipcHandlers/dbHandle');

let readerWindows = [];

fileHandle();
dbHandle();

let mainWin = null, tray = null
let options = {
    width: 1050,
    height: 660,
    frame: false,
    // transparent: true,
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
    // transparent: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
    },
};

const singleInstance = app.requestSingleInstanceLock();
if (!singleInstance) {
    app.quit();
} else {
    app.on("second-instance", (event, argv, workingDir) => {
        if (mainWin) {
            if (!mainWin.isVisible()) mainWin.show();
            mainWin.focus();
        }
    });
}

const initWindowBounds = (isMain, win) => {
    if (isMain) {
        store.get('mainWindowWidth') || store.set('mainWindowWidth', win.getSize()[0]);
        store.get('mainWindowHeight') || store.set('mainWindowHeight', win.getSize()[1]);
        store.get('mainWindowX') || store.set('mainWindowX', win.getPosition()[0]);
        store.get('mainWindowY') || store.set('mainWindowY', win.getPosition()[1]);
    } else {
        store.get('readerWindowWidth') || store.set('readerWindowWidth', win.getSize()[0]);
        store.get('readerWindowHeight') || store.set('readerWindowHeight', win.getSize()[1]);
        store.get('readerWindowX') || store.set('readerWindowX', win.getPosition()[0]);
        store.get('readerWindowY') || store.set('readerWindowY', win.getPosition()[1]);
    }
}

const init = () => {
    app.whenReady().then(async () => {
        try {
            await initDatabase();
            mainWin = createWindow();
            initWindowBounds(true, mainWin);

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
    console.log("是否最大化", win.isMaximized());
    if (win.isMaximized()) {
        if (win === mainWin) {
            const width = store.get("mainWindowWidth") || 1050;
            const height = store.get("mainWindowHeight") || 660;
            const x = store.get("mainWindowX") || mainWin.getPosition()[0];
            const y = store.get("mainWindowY") || mainWin.getPosition()[1];
            if (width && height) {
                win.setSize(width, height);
                if (x && y) {
                    win.setPosition(x, y);
                }
            }
        } else {
            // 处理阅读窗口
            console.log("阅读窗口最大化恢复原状");
            const width = store.get("readerWindowWidth") || 1050;;
            const height = store.get("readerWindowHeight") || 660;;
            const x = store.get("readerWindowX") || mainWin.getPosition()[0];
            const y = store.get("readerWindowY") || mainWin.getPosition()[1];
            if (width && height) {
                win.setSize(width, height);
                if (x && y) {
                    win.setPosition(x, y);
                }
            }
        }
    } else {
        console.log("执行最大化");
        win.maximize();
    }
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

//创建主窗口
const createWindow = () => {
    if (!mainWin) {
        // 从 electron-store 中获取窗口大小和位置
        const windowWidth = parseInt(store.get("mainWindowWidth") || 1050);
        const windowHeight = parseInt(store.get("mainWindowHeight") || 660);
        const windowX = parseInt(store.get("mainWindowX"));
        const windowY = parseInt(store.get("mainWindowY"));

        const mainWindow = new BrowserWindow({
            ...options,
            width: windowWidth,
            height: windowHeight,
            x: windowX,
            y: windowY
        });
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

        // 监听窗口大小改变事件
        mainWindow.on("resize", () => {
            if (!mainWindow.isDestroyed()) {
                if (!mainWindow.isMaximized()) {
                    let bounds = mainWindow.getBounds();
                    store.set({
                        mainWindowWidth: bounds.width,
                        mainWindowHeight: bounds.height,
                    });
                } else {
                    console.log('当前为大化状态，不保存窗口大小和位置');
                }
            }
        });

        // 监听窗口移动事件
        mainWindow.on("move", () => {
            if (!mainWindow.isDestroyed()) {
                if (!mainWindow.isMaximized()) {
                    let bounds = mainWindow.getBounds();
                    store.set({
                        mainWindowX: bounds.x,
                        mainWindowY: bounds.y,
                    });
                }
            }
        });

        return mainWindow
    }
    return mainWin;

}


// 监听渲染进程打开文件选择对话框的请求
ipcMain.handle('open-file-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWin, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'E-Books', extensions: ['epub', 'mobi', 'azw3'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    if (!canceled) {
        const fileInfos = [];
        for (const filePath of filePaths) {
            try {
                const fileData = await fs.promises.readFile(filePath);
                const fileName = path.basename(filePath);
                fileInfos.push({
                    data: fileData,
                    name: fileName,
                    path: filePath // 添加文件路径
                });
            } catch (error) {
                console.error('读取文件出错:', error);
            }
        }
        return fileInfos;
    }
    return null;
});

const sendToRenderer = (channel, args) => {
    try {
        if (mainWin) mainWin.webContents.send(channel, args)
    } catch (error) {
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
            width: parseInt(store.get("readerWindowWidth")),
            height: parseInt(store.get("readerWindowHeight")),
            x: parseInt(store.get("readerWindowX")),
            y: parseInt(store.get("readerWindowY"))
        });
        initWindowBounds(false, newReaderWindow);
        if (isDevEnv) {
            newReaderWindow.webContents.openDevTools();
        }
        newReaderWindow.loadURL(url);

        // 监听窗口大小改变事件
        newReaderWindow.on("resize", () => {
            if (!newReaderWindow.isDestroyed()) {
                if (!newReaderWindow.isMaximized()) {
                    let bounds = newReaderWindow.getBounds();
                    store.set({
                        readerWindowWidth: bounds.width,
                        readerWindowHeight: bounds.height,
                    });
                }
            }
        });

        // 监听窗口移动事件
        newReaderWindow.on("move", () => {
            if (!newReaderWindow.isDestroyed()) {
                if (!newReaderWindow.isMaximized()) {
                    let bounds = newReaderWindow.getBounds();
                    store.set({
                        readerWindowX: bounds.x,
                        readerWindowY: bounds.y,
                    });
                }
            }
        });


        // 监听窗口关闭事件
        newReaderWindow.on("close", (event) => {
            if (!newReaderWindow.isDestroyed()) {
                let bounds = newReaderWindow.getBounds();
                store.set({
                    readerWindowWidth: bounds.width,
                    readerWindowHeight: bounds.height,
                    readerWindowX: bounds.x,
                    readerWindowY: bounds.y,
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

app.on("ready", () => {
    init();
});