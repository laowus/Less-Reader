const path = require('path')
const { app } = require('electron')
const sqlite3 = require('sqlite3').verbose()

let db
// 获取数据库文件路径
const getDatabasePath = () => {
    return path.join(app.getPath('userData'), 'database.db');
}

// 创建数据库表
const createTable = () => {
    db.run(`
      CREATE TABLE IF NOT EXISTS items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_time TEXT,
        completeTime TEXT
      )
    `, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Table created.');
    });
}

const initDatabase = () => {
    const dbPath = getDatabasePath();
    console.log('Database path:', dbPath);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
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

        }, 1000); // 等待1秒
    });
}


//导出
module.exports = {
    initDatabase
}