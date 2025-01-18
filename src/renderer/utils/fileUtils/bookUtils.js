
import { makeBook } from '../../libs/view'
import Book from '../../models/Book';
import { ElMessage } from 'element-plus';

class BookUtil {
    static fs = window.require("fs");
    static path = window.require("path");
    static dataPath = localStorage.getItem("storageLocation")
        ? localStorage.getItem("storageLocation")
        : window.require("electron")
            .ipcRenderer.sendSync("storage-location", "ping");
    static ipcRenderer = window.require("electron").ipcRenderer;
    static bookDir = this.path.join(this.dataPath, "book");

    static addBook(key, buffer) {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.readAsArrayBuffer(new Blob([buffer]));
            reader.onload = async (event) => {
                if (!event.target) return;
                try {
                    if (!this.fs.existsSync(this.bookDir)) {
                        this.fs.mkdirSync(this.bookDir);
                    }
                    this.fs.writeFileSync(
                        this.path.join(this.bookDir, key),
                        Buffer.from(event.target.result)
                    );
                    resolve();
                } catch (error) {
                    reject();
                    throw error;
                }
            }
            reader.onerror = () => {
                reject();
            };
        })
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
        if (this.fs.existsSync(folderPath)) {
            this.fs.readdirSync(folderPath)
                .forEach((file, index) => {
                    var curPath = this.path.join(folderPath, file);
                    if (this.fs.lstatSync(curPath).isDirectory()) { // recurse
                        console.log("是一个文件夹");
                        this.deleteFolderRecursive(curPath);
                    } else { // delete file
                        this.fs.unlinkSync(curPath);
                    }
                });
            //this.fs.rmdirSync(folderPath);
        }
    }

    static delBook(book) {
        return new Promise((resolve, reject) => {
            try {
                const curPath = this.path.join(this.bookDir, book.key);
                console.log(curPath);
                if (this.fs.existsSync(curPath)) {
                    if (this.fs.lstatSync(curPath).isDirectory()) { // recurse
                        this.deleteFolderRecursive(curPath);
                    } else { // delete file
                        this.fs.unlinkSync(curPath);
                    }
                    resolve('文件删除成功!');
                } else {
                    reject("文件不存在");
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
                let cover = "";
                let key, name, author, publisher, description, charset, page;
                [name, author, description, publisher, charset, page] = [
                    bookName, "Unknown author", "", "", "", 0];
                let meta;
                /**解析文件 */
                console.log("makeBook", file);
                const book = await makeBook(file);
                console.log("解析后的book", book);
                meta = book.metadata;
                [name, author, description, publisher, cover] = [
                    meta.title || bookName, meta.author || "Unknown author",
                    meta.description || "", meta.publisher || "", meta.cover || ""
                ];
                if (extension === "epub" && cover.indexOf("image") === -1) {
                    cover = ""
                }
                let format = extension.toUpperCase();
                key = new Date().getTime() + "";
                resolve(
                    new Book(key, name, author, description, md5, cover,
                        format, publisher, size, page, path, charset)
                );
            } catch (error) {
                console.log(error);
                resolve("get_metadata_error");
            }
        });

    }

    static isBookExist(key, bookPath) {
        return new Promise((resolve, reject) => {
            //获取书籍目录位置
            const storePath = this.ipcRenderer.sendSync("storage-location", "ping");
            let _bookPath = this.path.join(localStorage.getItem("storageLocation") ? localStorage.getItem("storageLocation")
                : storePath, `book`, key);
            console.log(_bookPath);
            if ((bookPath && this.fs.existsSync(bookPath)) ||
                this.fs.existsSync(_bookPath)) {
                resolve(true);
            } else {
                resolve(false);
            }

        })
    }

    static async RedirectBook(book) {
        if (!this.isBookExist(book.key, book.path)) {
            ElMessage.error('<<' + book.name + '>> 不存在,或已经删除!');
            return;
        }
        let ref = book.format.toLowerCase();
        this.ipcRenderer.invoke("open-book", {
            url: `${window.location.href.split("#")[0]}#/read/${book.key}`
        });
    }


}

export default BookUtil