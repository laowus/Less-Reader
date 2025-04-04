
import { makeBook } from '../../libs/view'
import Book from '../../models/Book';
import { ElMessage } from 'element-plus';
const { ipcRenderer } = window.require('electron');
const fs = window.require('fs');
const path = window.require('path');

class BookUtil {
    static bookDir = localStorage.getItem("bookPath")
        ? localStorage.getItem("bookPath")
        : ipcRenderer.sendSync("get-book-path", "ping");

    static addBook(book) {
        console.log(book);

        ipcRenderer.send('copy-book', book.toMap());
    }

    static deleteAllFiles() {
        return new Promise((resolve, reject) => {
            try {
                this.deleteFolderRecursive(this.bookDir)
                resolve();
            } catch (error) {
                reject();
                throw error;
            }
        });
    }

    static deleteFolderRecursive(folderPath) {
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath)
                .forEach((file, index) => {
                    var curPath = this.path.join(folderPath, file);
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        console.log("是一个文件夹");
                        this.deleteFolderRecursive(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
            //this.fs.rmdirSync(folderPath);
        }
    }

    static delBook(book) {
        this.delFile(book.cover);
        this.delFile(book.path);
    }

    static delFile(file) {
        return new Promise((resolve, reject) => {
            try {
                if (fs.existsSync(file)) {
                    if (fs.lstatSync(file).isDirectory()) { // recurse
                        this.deleteFolderRecursive(file);
                    } else { // delete file
                        fs.unlinkSync(file);
                    }
                    resolve('文件删除成功!');
                }
            } catch (error) {
                reject("文件删除错误");
                throw error;
            }
        });
    }

    static generateBook(bookName, extension, md5, size, path, file) {
        return new Promise(async (resolve, reject) => {
            try {
                let coverString = "";
                let cover = "";
                let frompath = path;
                let key, name, author, publisher, description, charset, page;
                [name, author, description, publisher, charset, page] = [
                    bookName, "Unknown author", "", "", "", 0];
                let meta;
                /**解析文件 */
                console.log("makeBook", file);
                const book = await makeBook(file);
                meta = book.metadata;
                [name, author, description, publisher, coverString] = [
                    meta.title || bookName, meta.author || "Unknown author",
                    meta.description || "", meta.publisher || "", meta.cover || ""
                ];
                let format = extension.toLowerCase();
                key = new Date().getTime() + "";
                if (extension === "epub" && coverString.indexOf("image") === -1) {
                    coverString = ""
                }
                if (coverString) {
                    cover = this.getCoverPath(key, name);
                    await this.saveCoverToLocal(coverString, cover);
                }
                path = this.getBookPath(key, name, format);
                resolve({
                    success: true, book:
                        new Book(0, key, name, author, description, md5, cover, format, publisher, size, page, frompath, path, charset)
                });
            } catch (error) {
                console.log(error);
                resolve({ success: false });
            }
        });

    }
    static getBookPath = (key, name, format) => {
        // 获取保存路径，这里假设使用默认的书籍目录
        const bookDir = localStorage.getItem("bookPath")
            ? localStorage.getItem("bookPath")
            : ipcRenderer.sendSync("get-book-path", "ping");

        return path.join(bookDir, key + name + "." + format);
    }

    static getCoverPath = (key, name) => {
        // 获取保存路径，这里假设使用默认的书籍目录
        const coverDir = localStorage.getItem("coverPath")
            ? localStorage.getItem("coverPath")
            : ipcRenderer.sendSync("get-cover-path", "ping");

        return path.join(coverDir, key + name + ".jpg");
    }

    static saveCoverToLocal(coverData, coverPath) {
        return new Promise((resolve, reject) => {
            // 提取 Base64 数据部分
            const base64Data = coverData.split(',')[1];
            // 解码 Base64 数据
            const fileBuffer = Buffer.from(base64Data, 'base64');
            // 写入文件
            fs.writeFile(coverPath, fileBuffer, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(coverPath);
                }
            });
        });
    }


    static isBookExist(bookPath) {
        return new Promise((resolve, reject) => {
            //获取书籍目录位置
            if ((bookPath && fs.existsSync(bookPath)) ||
                fs.existsSync(_bookPath)) {
                resolve(true);
            } else {
                resolve(false);
            }

        })
    }

    static async RedirectBook(book) {
        if (!this.isBookExist(book.path)) {
            ElMessage.error('<<' + book.name + '>> 不存在,或已经删除!');
            return;
        }

        ipcRenderer.send("open-book", {
            url: `${window.location.href.split("#")[0]}#/read/${book.id}`,
            name: book.name,
            bookid: book.id
        });
    }
}

export default BookUtil