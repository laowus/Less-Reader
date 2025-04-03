<script setup>
import { ref, onMounted } from 'vue';
import { fetchMD5 } from '../utils/fileUtils/md5Util';
import BookUtil from '../utils/fileUtils/bookUtils';
import { ElMessage } from 'element-plus';
import BookListItem from '../components/BookListItem.vue';
import StyleUtil from '../utils/readUtils/styleUtil.js'
import EventBus from '../../common/EventBus';
const { ipcRenderer } = window.require('electron');
const booklist = ref([]);
const selectedBooks = ref([]);
const filelistRef = ref([]);
const dialogFormVisible = ref(false);
const confirmVisible = ref(false);
let fileList = [];
let clickFilePath = "";
const currentStyle = ref(StyleUtil.getStyle())

const handleClose = () => {
    ipcRenderer.send('window-close');
}

const handleMax = () => {
    ipcRenderer.send('window-max');
}
const handleMix = () => {
    ipcRenderer.send('window-min');
}

//上传
const getFiles = () => {
    Promise.all(fileList.map(async (file) => {
        await getMd5WithBrowser(file.raw);
    })).then(() => {
        console.log('getFiles');
        loadContent(); // 所有文件处理完成后更新 bookList
    }).catch((error) => {
        console.error('处理文件时出错:', error);
    });
}
//关闭上传弹窗
const closeUpload = () => {
    filelistRef.value = [];
    dialogFormVisible.value = false;
}
const handleChange = (file, uploadFiles) => {
    fileList = uploadFiles;
}

const handleRemove = (file, uploadFiles) => {
    fileList = uploadFiles;
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
    let extension = (file.name).split(".").reverse()[0].toLocaleLowerCase();
    let bookName = file.name.substr(0, file.name.length - extension.length - 1);
    let isRepeat = false;
    if (booklist.value.length > 0) {
        booklist.value.forEach((item) => {
            if (item.md5 === md5 && item.size === file.size) {
                isRepeat = true;
                ElMessage.error('<<' + bookName + '>> 已经存在!');
                return resolve();
            }
        });
    }
    if (!isRepeat) {
        try {
            const book = await BookUtil.generateBook(bookName, extension, md5, file.size, file.path || clickFilePath, file);
            await handleAddBook(book);
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
                    // booklist.value.push(book);
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
    ipcRenderer.send("db-get-books");

    ipcRenderer.on("home-set-theme-response", (event, success) => {
        console.log(success);
        currentStyle.value = StyleUtil.getStyle();
    });
}
onMounted(() => {
    loadContent();
});

</script>
<template>
    <div class="main-container" :style="{ '--bbc': currentStyle.btnBgColor, '--bg': currentStyle.backgroundColor, '--fc': currentStyle.fontColor }">
        <el-dialog
            v-model="dialogFormVisible" title="导入书籍" width="500" draggable>
            <el-upload
                class="upload-demo" drag action="#" accept=".epub,.mobi,.azw3"
                :auto-upload="false" :on-remove="handleRemove" :on-change="handleChange"
                :file-list="filelistRef" multiple>
                <el-icon class="el-icon--upload">
                    <upload-filled />
                </el-icon>
                <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                    <div class="el-upload__tip">
                        格式 : epub / mobi / azw3
                    </div>
                </template>
            </el-upload>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="closeUpload">
                        取消
                    </el-button>
                    <el-button type="primary" @click="getFiles">
                        确认
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <div class="header">
            <div class="header-left">
                <input type="text" class="header-search-box" placeholder="搜索我的书库">
                <span class="header-search-text">
                    <span class="iconfont icon-sousuo header-search-icon"></span>
                </span>
            </div>
            <div class="drag-bar"></div>
            <div class="header-right">
                <button class="btn-text-icon" @click="dialogFormVisible = true">
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
    border-radius: 20px;
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
    width: 95%;
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.header-search-box {
    width: 150px;
    height: 30px;
    border-radius: 25px;
    margin-left: 2rem;
    padding-left: 5px;
}

.drag-bar {
    flex: 1;
    user-select: none;
    -webkit-app-region: drag;
    -webkit-user-select: none;
    height: 100%;
    display: flex;

}

.header-left {
    display: flex;
    flex-direction: row;
    align-items: center;
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
    padding: 1rem;
    border-radius: 20px;

}
</style>