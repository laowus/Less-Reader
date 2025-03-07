
import { makeBook } from '../../libs/view'
import Book from '../../models/Book';
import { ElMessage } from 'element-plus';
const { ipcRenderer } = window.require('electron');

class BookUtil {
    static bookDir = localStorage.getItem("bookPath")
        ? localStorage.getItem("bookPath")
        : ipcRenderer.sendSync("get-book-path", "ping");

    static addBook(book) {
        ipcRenderer.sendSync('copy-book', book.toMap());
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
        return new Promise((resolve, reject) => {
            try {
                const curPath = this.path.join(this.bookDir, book.key);
                console.log(curPath);
                if (fs.existsSync(curPath)) {
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        this.deleteFolderRecursive(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
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
            const storePath = ipcRenderer.sendSync("storage-location", "ping");
            let _bookPath = path.join(localStorage.getItem("storageLocation") ? localStorage.getItem("storageLocation")
                : storePath, `book`, key);
            console.log(_bookPath);
            if ((bookPath && fs.existsSync(bookPath)) ||
                fs.existsSync(_bookPath)) {
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
        ipcRenderer.invoke("open-book", {
            url: `${window.location.href.split("#")[0]}#/read/${book.key}`
        });
    }


}

export default BookUtil