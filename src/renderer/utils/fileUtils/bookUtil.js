
import { fetchMD5 } from './md5Util';

export const getMd5WithBrowser = async (file) => {
    const bookName = file.name.substr(0, file.name.lastIndexOf('.'));
    return new Promise(async (resolve, reject) => {
        const md5 = await fetchMD5(file);
        if (!md5) {
            ElMessage.error(' <<' + bookName + '>> md5失败!');
            reject();
        } else {
            try {
                await handleBook(file, md5);
                resolve();
            } catch (error) {
                console.log(error);
            }
        }
    })
}

// 处理书籍
// 1.判断是否存在,每本书都有一个特定的md5,假如md5和文件大小一致,即为重复书籍
// 2. 不重复, 获取书籍信息,书名/作者/封面cover(封面cover为base64的字符串)等
// 
const handleBook = async (file, md5) => {
    // 发送文件信息到主进程
    let extension = (file.name).split(".").reverse()[0].toLocaleLowerCase();
    let bookName = file.name.substr(0, file.name.length - extension.length - 1);
    let isRepeat = false;
    if (booklist.value.length > 0) {
        booklist.value.forEach((item) => {
            if (item.md5 === md5 && item.size === file.size) {
                isRepeat = true;
                console.log('<<' + bookName + '>> 已经存在!');
                ElMessage.error('<<' + bookName + '>> 已经存在!');
            }
        });
    }
    if (!isRepeat) {
        try {
            const res = await BookUtil.generateBook(bookName, extension, md5, file.size, file.path || clickFilePath, file);
            if (res.success) {
                console.log(res.book);
                await handleAddBook(res.book);
            } else {
                ElMessage.error('<<' + bookName + '>> 文件有问题, 导入失败!');
            }

        } catch (error) {
            console.log(error);
        }
    }
}

//删除选中的书籍
const delSelectBooks = () => {
    if (selectedBooks.value.length > 0) {
        console.log(selectedBooks.value);
        for (const item of selectedBooks.value) {
            ipcRenderer.once("db-delete-book-response", (event, res) => {
                if (res.success) {
                    booklist.value = booklist.value.filter((book) => book.id !== item.id);
                    BookUtil.delBook(item);
                    ElMessage.success('删除' + item.name + '成功!');
                } else {
                    ElMessage.error('删除' + item.name + '失败!');

                }
            });
            ipcRenderer.send('db-delete-book', item.id);
        }
        // 清空选中的书籍列表
        selectedBooks.value = [];
        confirmVisible.value = false;
    }
}