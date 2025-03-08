const { ipcMain } = require('electron')
const { insertBook, selectAllBook, getBookByKey, updateBook } = require('../dbTool')

const dbHandle = () => {

    ipcMain.on('db-insert-book', (event, book) => {
        insertBook(book, event);
    });

    ipcMain.on("db-get-books", (event, arg) => {
        selectAllBook(event);
    });

    ipcMain.on("db-get-book", (event, key) => {
        getBookByKey(key, event);
    });

    ipcMain.on("db-update-book", (event, book) => {
        updateBook(book, event);
    });
}


module.exports = dbHandle;