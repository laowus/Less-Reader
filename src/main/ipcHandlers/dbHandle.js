const { ipcMain } = require('electron')
const { insertBook, selectAllBook, getBookByKey, updateBook, deleteBook, insertNote, getAllNotes, updateNote, deleteNote, getNoteByCfi } = require('../dbTool')

const dbHandle = () => {

    ipcMain.on('db-insert-book', (event, book) => {
        insertBook(book, event);
    });

    ipcMain.on("db-get-books", (event, arg) => {
        selectAllBook(event);
    });

    ipcMain.on("db-get-book", (event, bookId) => {
        getBookByKey(bookId, event);
    });

    ipcMain.on("db-update-book", (event, book) => {
        updateBook(book, event);
    });

    ipcMain.on("db-delete-book", (event, key) => {
        deleteBook(bookId, event);
    });

    ipcMain.on("db-insert-note", (event, note) => {
        insertNote(note, event);
    });

    ipcMain.on("db-get-notes", (event, bookId) => {
        getAllNotes(bookId, event);
    })

    ipcMain.on("db-update-note", (event, note) => {
        updateNote(note, event);
    })

    ipcMain.on("db-delete-note", (event, noteId) => {
        deleteNote(noteId, event);
    })

    ipcMain.on("db-get-book-by-cfi", (event, cfi) => {
        getNoteByCfi(cfi, event)
    })



}


module.exports = dbHandle;