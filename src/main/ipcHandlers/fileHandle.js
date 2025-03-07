const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');
const dataPath = path.join(app.getPath("userData"), "data");
const bookPath = path.join(dataPath, "book");
const coverPath = path.join(dataPath, "cover");

// 封装的函数，判断文件夹是否存在，不存在则创建
const ensureDirectoryExists = (dirPath) => {
    fs.access(dirPath, fs.constants.F_OK, (err) => {
        if (err) {
            // 文件夹不存在，创建它
            fs.mkdir(dirPath, { recursive: true }, (mkdirErr) => {
                if (mkdirErr) {
                    console.error("Error creating folder:", mkdirErr);
                } else {
                    console.log("Folder created successfully:", dirPath);
                }
            });
        } else {
            // 文件夹存在
            console.log("Folder already exists:", dirPath);
        }
    });
};

const fileHandle = () => {
    ipcMain.on("get-book-path", (event, arg) => {
        ensureDirectoryExists(bookPath);
        event.returnValue = bookPath;
    });
    ipcMain.on("get-cover-path", (event, arg) => {
        ensureDirectoryExists(coverPath);
        event.returnValue = coverPath;
    });


    ipcMain.on('copy-book', (event, book) => {
        ensureDirectoryExists(bookPath);
        const toPath = path.join(bookPath, book.key + book.name + "." + book.format);
        fs.copyFile(book.path, toPath, (err) => {
            if (err) {
                console.error("Error copying file:", err);
                event.reply('copy-book-error', err);

            } else {
                console.log("File copied successfully:", toPath);
                event.reply('copy-book-success', toPath);
            }
        });
    });
}

module.exports = fileHandle;