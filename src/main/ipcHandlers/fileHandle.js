const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');
const { ensureDirectoryExists } = require('../common');
const dataPath = path.join(app.getPath("userData"), "bookdata");
const bookPath = path.join(dataPath, "book");
const coverPath = path.join(dataPath, "cover");

const fileHandle = () => {
    // 获取书籍保存路径
    ipcMain.on("get-book-path", (event, arg) => {
        ensureDirectoryExists(bookPath);
        event.returnValue = bookPath;
    });
    // 获取封面保存路径
    ipcMain.on("get-cover-path", (event, arg) => {
        ensureDirectoryExists(coverPath);
        event.returnValue = coverPath;
    });


    ipcMain.on('copy-book', (event, book) => {
        ensureDirectoryExists(bookPath);
        fs.copyFile(book.frompath, book.path, (err) => {
            if (err) {
                console.error("Error copying file:", err);
                event.reply('copy-book-error', err);

            } else {
                console.log("File copied successfully:", book.path);
                event.reply('copy-book-success', book.path);
            }
        });
    });
}

module.exports = fileHandle;
