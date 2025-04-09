const path = require('path')
const { app, ipcMain } = require('electron')
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose()
const bookData = path.join(app.getPath('userData'), 'bookdata');
const { ensureDirectoryExists } = require('./common');
let db

// 获取数据库文件路径
const getDatabasePath = () => {
    ensureDirectoryExists(bookData);
    return path.join(bookData, 'database.db');
}

// 创建数据库表
const createTable = () => {
    db.run(`
        CREATE TABLE tb_books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT,
            name TEXT,
            author TEXT,
            description TEXT,
            md5 TEXT,
            cover TEXT,
            format TEXT,    
            publisher TEXT,
            size INTEGER,   
            page INTEGER,
            frompath TEXT,
            path TEXT,
            charset TEXT,
            lastReadPosition TEXT,
            readingPercentage TEXT,
            currentChapter TEXT
        )
    `, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Table tb_books created.');
    });
    db.run(`
       CREATE TABLE tb_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bookId INTEGER,
            color TEXT, 
            note TEXT,
            type TEXT,
            cfi TEXT,
            chapter TEXT,
            createTime TEXT,
            updateTime TEXT
        )
    `, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Table tb_notes created.');
    });
}

const initDatabase = () => {
    const dbPath = getDatabasePath();
    console.log('Database path:', dbPath);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 检查数据库文件是否存在
            fs.access(dbPath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.log('Database file does not exist. Creating a new one.');
                    db = new sqlite3.Database(dbPath, (err) => {
                        if (err) {
                            console.error(err.message);
                            reject(err);
                        } else {
                            console.log('Connected to the SQLite database.');
                            createTable();
                            resolve();
                        }
                    });
                } else {
                    console.log('Database file already exists.');
                    db = new sqlite3.Database(dbPath, (err) => {
                        if (err) {
                            console.error(err.message);
                            reject(err);
                        } else {
                            console.log('Connected to the existing SQLite database.');
                            resolve();
                        }
                    });
                }
            });
        }, 1000); // 等待1秒
    });
}

const insertBook = (book, event) => {
    db.run(`
    INSERT INTO tb_books (key, name, author, description, md5, cover, format, publisher, size, page, frompath, path, charset) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [book.key, book.name, book.author, book.description, book.md5, book.cover, book.format, book.publisher, book.size, book.page, book.frompath, book.path, book.charset], function (err) {
        if (err) {
            console.error(err.message);
            event.reply('db-insert-book-response', { success: false });
        } else {
            console.log('Data inserted with id:', this.lastID);
            event.reply('db-insert-book-response', { success: true, id: this.lastID });
        }
    });

}

const selectAllBook = (event, keyword) => {
    let strSql = `SELECT * FROM tb_books`;
    if (keyword) {
        strSql = `SELECT * FROM tb_books WHERE name like '%${keyword}%'`;
    }

    db.all(strSql, (err, rows) => {
        if (err) {
            console.error(err.message);
            event.reply('db-select-book-response', { success: false, data: [] });
        } else {
            //console.log('Data selected:', rows);
            event.reply('db-select-book-response', { success: true, data: rows });
        }
    })
}

const getBookByKey = (bookId, event) => {

    db.all(`SELECT * FROM tb_books WHERE id = ?`, [bookId], (err, rows) => {
        if (err) {
            console.error(err.message);
            event.reply('db-get-book-response', { success: false });
        } else {
            event.reply('db-get-book-response', { success: true, data: rows });
        }
    });
}

const updateBook = (book, event) => {
    db.run(`
        UPDATE tb_books 
        SET name = ?, 
            author = ?, 
            description = ?, 
            md5 = ?, 
            cover = ?, 
            format = ?, 
            publisher = ?, 
            size = ?, 
            page = ?, 
            frompath = ?, 
            path = ?, 
            charset = ?, 
            lastReadPosition = ?, 
            readingPercentage = ? ,
            currentChapter = ?
            
        WHERE id = ?
    `, [
        book.name,
        book.author,
        book.description,
        book.md5,
        book.cover,
        book.format,
        book.publisher,
        book.size,
        book.page,
        book.frompath,
        book.path,
        book.charset,
        book.lastReadPosition,
        book.readingPercentage,
        book.currentChapter,
        book.id
    ], function (err) {
        if (err) {
            event.reply('db-update-book-response', { success: false, error: err.message });
        } else {
            event.reply('db-update-book-response', { success: true, id: this.lastID });
        }
    });

};

const deleteBook = (id, event) => {

    db.run(`DELETE FROM tb_books WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Failed to delete book:', err.message);
            event.reply('db-delete-book-response', { success: false, error: err.message });
        } else {
            console.log('Book deleted with id:', this.lastID);
            event.reply('db-delete-book-response', { success: true, id: this.lastID });
        }
    })
}

const insertNote = (note, event) => {
    db.get(`SELECT * FROM tb_notes WHERE bookId = ? AND cfi = ?`, [note.bookId, note.cfi], (err, row) => {
        if (err) {
            console.error(err.message);
            event.reply('db-insert-note-response', { success: false, error: err.message });
        } else if (row) {
            console.log('记录已经存在，更新记录');
            console.log('Note already exists in the database. Updating the note.', row);
            updateNote(note, row.id, event);
        } else {
            console.log('记录不存在，插入新记录');
            db.run(`INSERT INTO tb_notes (bookId, color, note, type, cfi,chapter,createTime,updateTime) 
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [note.bookId, note.color, note.note, note.type, note.cfi, note.chapter],
                function (err) {
                    if (err) {
                        console.error(err.message);
                        event.reply('db-insert-note-response', { success: false, error: err.message });
                    } else {
                        console.log('Note inserted with id:', this.lastID);
                        const resNote = { ...note, ...{ id: this.lastID } }
                        event.reply('db-insert-note-response', { success: true, data: resNote });
                    }
                });
        }
    });
}

const updateNote = (note, noteId, event) => {
    console.log('updateNote:', note, noteId);
    db.run(`UPDATE tb_notes 
        SET color = ?, 
            type = ?,
            updateTime = datetime('now')
        WHERE id = ?`, [
        note.color,
        note.type,
        noteId
    ], function (err) {
        if (err) {
            console.error('Failed to update note:', err.message);
            event.reply('db-updateNote-response', { success: false, error: err.message });
        } else {
            console.log('Note updated with id:', this.lastID);
            const resNote = { ...note, ...{ id: this.lastID } }
            event.reply('db-updateNote-response', { success: true, data: resNote });
        }
    });
}

const getAllNotes = (bookId, event) => {
    db.all(`SELECT * FROM tb_notes where bookId = ? `, [bookId], (err, rows) => {
        if (err) {
            console.error(err.message);
            event.reply('db-get-all-notes-response', { success: false });
        } else {
            event.reply('db-get-all-notes-response', { success: true, data: rows });
        }
    })
}

const deleteNote = (noteId, event) => {
    db.run(`DELETE FROM tb_notes WHERE id = ?`, [noteId], function (err) {
        if (err) {
            console.error('Failed to delete note:', err.message);
            event.reply('db-delete-note-response', { success: false, error: err.message });
        } else {
            console.log('Note deleted with id:', this.lastID);
            event.reply('db-delete-note-response', { success: true, id: this.lastID });
        }
    })
}

const getNoteByCfi = (cfi, event) => {
    db.get(`SELECT * FROM tb_notes WHERE cfi = ?`, [cfi], (err, row) => {
        if (err) {
            console.error(err.message);
            event.reply('db-get-note-by-cfi-response', { success: false });
        } else {
            event.reply('db-get-note-by-cfi-response', { success: true, data: row });
        }
    })
}

//导出
module.exports = {
    initDatabase,
    insertBook,
    selectAllBook,
    getBookByKey,
    updateBook,
    deleteBook,
    insertNote,
    getAllNotes,
    updateNote,
    deleteNote,
    getNoteByCfi
};