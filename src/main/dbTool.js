const path = require('path')
const { app } = require('electron')
const sqlite3 = require('sqlite3').verbose()
const fs = require('fs');

let db
// 获取数据库文件路径
const getDatabasePath = () => {
    return path.join(app.getPath('userData'), 'database.db');
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
            path TEXT,
            charset TEXT
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
            book_id INTEGER,
            content TEXT,
            cfi TEXT,
            chapter TEXT,
            type TEXT,
            color TEXT,
            create_time TEXT,
            update_time TEXT
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
    console.log('Insert book:', book);
    db.run(`
    INSERT INTO tb_books (key, name, author, description, md5, cover, format, publisher, size, page, path, charset) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [book.key, book.name, book.author, book.description, book.md5, book.cover, book.format, book.publisher, book.size, book.page, book.path, book.charset], function (err) {
        if (err) {
            console.error(err.message);
            event.reply('db-insert-book-response', { success: false });
        } else {
            console.log('Data inserted with id:', this.lastID);
            event.reply('db-insert-book-response', { success: true, id: this.lastID });
        }
    });

}

const selectAllBook = (event) => {
    db.all(`SELECT * FROM tb_books`, (err, rows) => {
        if (err) {
            console.error(err.message);
            event.reply('db-select-book-response', { success: false });
        } else {
            // console.log('Data selected:', rows);
            event.reply('db-select-book-response', { success: true, data: rows });
        }
    })
}

//导出
module.exports = {
    initDatabase,
    insertBook,
    selectAllBook
}