const { ipcMain } = require('electron')
const { insertBook, selectAllBook, getBookByKey, updateBook, deleteBook } = require('../dbTool')

const dbHandle = () => {

    ipcMain.on('db-insert-book', (event, book) => {
        insertBook(book, event);
    });

    ipcMain.on("db-get-books", (event, arg) => {
        selectAllBook(event);
    });

    ipcMain.on("db-get-book", (event, bookId) => {
        console.log("db-get-book", bookId);
        getBookByKey(bookId, event);
    });

    ipcMain.on("db-update-book", (event, book) => {
        updateBook(book, event);
    });

    ipcMain.on("db-delete-book", (event, key) => {
        deleteBook(key, event);
    });
}


module.exports = dbHandle;