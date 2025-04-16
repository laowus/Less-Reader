<script setup>
import { ref, onMounted } from 'vue';
import { fetchMD5 } from '../utils/fileUtils/md5Util';
import BookUtil from '../utils/fileUtils/bookUtils';
import { ElMessage } from 'element-plus';
import BookListItem from '../components/BookListItem.vue';
import StyleUtil from '../utils/readUtils/styleUtil.js'
const { ipcRenderer } = window.require('electron');
const booklist = ref([]);
const selectedBooks = ref([]);
const filelistRef = ref([]);
const dialogFormVisible = ref(false);
const confirmVisible = ref(false);
const $ = document.querySelector.bind(document)
let clickFilePath = "";
const currentStyle = ref(StyleUtil.getStyle())
const keyword = ref("");
const handleClose = () => {
    ipcRenderer.send('window-close');
}
const handleMax = () => {
    ipcRenderer.send('window-max');
}
const handleMix = () => {
    ipcRenderer.send('window-min');
}

// 触发主进程的文件选择对话框
const openFileDialog = async () => {
    //返回选择的文件信息数组,包含文件的data,name,path
    const fileInfos = await ipcRenderer.invoke('open-file-dialog');
    if (fileInfos) {
        console.log('选择的文件信息:', fileInfos);
        for (const fileInfo of fileInfos) {
            const { data, name, path } = fileInfo;
            const blob = new Blob([data], { type: 'application/octet-stream' });
            const file = new File([blob], name);
            // 给 File 对象添加 path 属性
            Object.defineProperty(file, 'path', {
                value: path,
                writable: false,
                enumerable: true,
                configurable: false
            });
            console.log('成功创建 File 对象:', file);
            // 这里可以对创建好的 File 对象进行后续操作
            await getMd5WithBrowser(file);
        }
        loadContent(); // 所有文件处理完成后更新 bookList
    } else {
        console.log('未选择文件或读取文件出错');
    }
};

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
//获取书籍md5
const getMd5WithBrowser = async (file) => {
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
// 添加数据操作. 复制书籍到用户文件夹/upload/book下
// 复制数据信息到IndexDb中
const handleAddBook = async (book) => {
    return new Promise(async (resolve, reject) => {
        try {
            ipcRenderer.once("db-insert-book-response", (event, res) => {
                if (res.success) {
                    BookUtil.addBook(book); // 复制文件
                    book.id = res.id;
                    ElMessage.success(`导入 <<${book.name || '未知书名'}>> 成功!`);
                    filelistRef.value = [];
                    dialogFormVisible.value = false;
                } else {
                    ElMessage.error(`导入 <<${book.name || '未知书名'}>> 失败!`);
                }
                resolve();
            });
            ipcRenderer.send('db-insert-book', book);
        } catch (error) {
            reject(error);
        }
    });
};
//选中 书籍
const selectBook = (isSelected, book) => {
    isSelected ? selectedBooks.value.push(book) : unSelectBook(book);
    console.log(selectedBooks.value);
}
//取消选中
const unSelectBook = (book) => {
    selectedBooks.value = selectedBooks.value.filter((item) => item !== book);
}
const loadContent = () => {
    ipcRenderer.once("db-select-book-response", (event, items) => {
        console.log(items);
        booklist.value = items.data.length > 0 ? items.data : [];
    });
    ipcRenderer.send("db-get-books", keyword.value);

    ipcRenderer.on("home-set-theme-response", (event, success) => {
        console.log(success);
        currentStyle.value = StyleUtil.getStyle();
    });
}
onMounted(() => {
    loadContent();
});

const setKeyword = () => {
    keyword.value = $('.header-search-box').value;
    loadContent();
}

</script>
<template>
    <div class="main-container" :style="{ '--bbc': currentStyle.btnBgColor, '--bg': currentStyle.backgroundColor, '--fc': currentStyle.fontColor }">

        <div class="header">
            <div class="header-left">
                <input type="text" class="header-search-box" placeholder="搜索我的书库">
                <span class="iconfont icon-sousuo1" @click="setKeyword"></span>
            </div>
            <div class="drag-bar"></div>
            <div class="header-right">
                <button class="btn-text-icon" @click="openFileDialog">
                    <span class="iconfont icon-jia">
                    </span> 书籍
                </button>
                <button class="btn-icon">
                    <span class="iconfont icon-shuaxin">
                    </span>
                </button>
                <el-popover :visible="confirmVisible" placement="top" :width="180">
                    <ul style="font-size: 12px;">
                        <li style="font-weight: bolder;">你确定要删除以下的书籍?</li>
                        <li v-for="(item, index) in selectedBooks" :key="index">
                            {{ index + 1 }}、{{ item.name }}
                        </li>
                    </ul>
                    <div style="text-align: right; margin: 0">
                        <el-button size="small" text @click="confirmVisible = false">取消</el-button>
                        <el-button size="small" type="primary" @click="delSelectBooks">
                            确认
                        </el-button>
                    </div>
                    <template #reference>
                        <el-button type="danger" v-show="selectedBooks.length > 0" @click="confirmVisible = true">
                            <el-icon class="el-icon--right">
                                <Delete />
                            </el-icon> 删除
                        </el-button>
                    </template>
                </el-popover>
            </div>
            <div class="btns-tool">
                <button class="btn-icon" title="最小化" @click="handleMix">
                    <span class="iconfont icon-zuixiaohua"></span>
                </button>
                <button class="btn-icon" title="最大化" @click="handleMax">
                    <span class="iconfont icon-zuidahua_huaban1"></span>
                </button>
                <button class="btn-icon" title="关闭" @click="handleClose">
                    <span class="iconfont icon-guanbi"></span>
                </button>
            </div>
        </div>
        <div class="book-list-container">
            <BookListItem v-for="item in booklist" :book="item" :isSelected="selectedBooks.indexOf(item) > -1" :key="item.key" :selectedBooks="selectedBooks" :selectChangedFn="selectBook" />
        </div>
    </div>
</template>
<style>
.btns-tool {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    margin-left: 4rem;
}

.main-container {
    width: 100%;
    height: 100% !important;
    background-color: var(--bg);
    color: var(--fc);
    display: flex;
    flex-direction: column;
    padding: 10px;
}

.main-container .btn-text-icon {
    width: 4rem;
    height: 2rem;
    padding: 0;
    font-size: 14px;
    line-height: 2rem;
    font-weight: 600;
    border-color: transparent;
    cursor: pointer;
    color: var(--fc);
    background-color: var(--bbc);
    border-radius: 10px;
}

.main-container .btn-icon {
    color: var(--fc);
    background-color: var(--bbc);
    border-radius: 5px;
    width: 2rem;
    height: 2rem;
}

.header {
    width: 100%;
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-right: 1rem;
}

.header-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: var(--bbc);
    border: none;
    color: var(--fc);
    margin-left: 1rem;
    padding-right: 1rem;
    border-radius: 25px;
    justify-content: space-between;
}

.header-search-box {
    width: 150px;
    height: 30px;
    margin-left: 1rem;
    background-color: var(--bbc);
    color: var(--fc);
}

/* 设置 placeholder 颜色 */
.header-search-box::placeholder {
    color: var(--fc);
    /* 可以根据需要修改颜色 */
}

.header-left .iconfont {
    cursor: pointer;
}

.drag-bar {
    flex: 1;
    user-select: none;
    -webkit-app-region: drag;
    -webkit-user-select: none;
    height: 100%;
    display: flex;

}


.header-right {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
}


.book-list-container {
    flex: 1;
    background-color: var(--bg);
    border-radius: 20px;
    overflow-y: auto;

}
</style>