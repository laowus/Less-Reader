<script setup>
import { ref, onMounted, toRaw, watch } from 'vue';
import { fetchMD5 } from '../utils/fileUtils/md5Util';
import BookUtil from '../utils/fileUtils/bookUtils';
import { ElMessage } from 'element-plus';
import BookListItem from '../components/BookListItem.vue';
const { ipcRenderer } = window.require('electron');
const booklist = ref([]);
const selectedBooks = ref([]);
const filelistRef = ref([]);
const dialogFormVisible = ref(false);
const confirmVisible = ref(false);
let fileList = [];
let clickFilePath = "";

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
}

onMounted(() => {
    loadContent();
});


</script>
<template>
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
        <div class="header-search-container">
            <div style="position: relative;">
                <input type="text" class="header-search-box" placeholder="搜索我的书库">
                <span class="header-search-text">
                    <span class="iconfont icon-sousuo header-search-icon"></span>
                </span>
            </div>

        </div>
        <div class="import-from-local">
            <el-button type="success" @click="dialogFormVisible = true">
                <el-icon class="el-icon--right">
                    <Upload />
                </el-icon> 导入书籍
            </el-button>
            <el-button type="warning" @click="loadContent">
                <el-icon>
                    <Refresh />
                </el-icon>
            </el-button>
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
    </div>
    <div class="book-list-container-parent">
        <div class="book-list-container">
            <ul class="book-list-item-box">
                <BookListItem v-for="item in booklist" :book="item" :isSelected="selectedBooks.indexOf(item) > -1" :key="item.key" :selectedBooks="selectedBooks" :selectChangedFn="selectBook" />
            </ul>
        </div>
    </div>

</template>

<style>
.header {
    width: 80%;
    height: 80px;
}

.header-search-container {
    position: absolute;
    top: 50px;
    margin-left: 5px;
    width: 220px;

}

.header-search-box {
    background-color: rgba(75, 75, 75, 0.1);
    color: rgba(75, 75, 75, 0.8);
    width: calc(100% - 20px);
    height: 39px;
    border-radius: 22px;
    border-style: none;
    outline: none;
    font-size: 15px;
    padding: 0px;
    padding-left: 20px;
}

.header-search-text {
    position: absolute;
    top: 0px;
    right: 0px;
    font-size: 15px;
    display: inline-block;
    width: 40px;
    height: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.header-search-icon {
    font-size: 22px;
    display: inline-block;
    opacity: 0.6;
    cursor: pointer;
}

.import-from-local {
    position: fixed;
    right: 0px;
    top: 30px;
    width: 320px;
    margin-right: 10px;
    margin-top: 23px;
    min-width: 42px;
    height: 42px;
    opacity: 1;
    border-radius: 25px;
    line-height: 42px;
    text-align: center;
    cursor: pointer;
    z-index: 0;
    font-size: 16px;
    transition: 0.1s;
    font-weight: 500;
}

.book-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    bottom: 10px;
    left: 220px;
    width: calc(100% - 220px);
}

.booklist-manage-container {
    cursor: pointer;
}

.book-list-view {
    font-size: 14px;
    clear: both;
    width: 100px;
    z-index: 1;
    height: 20px;
    overflow: hidden;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: space-around;
    transition: all 0.1s ease;
}

.card-list-mode {
    line-height: 17px;
    cursor: pointer;
    display: inline-block;
    font-size: 17px;
}

.book-list-container-parent {
    position: absolute;
    top: 120px;
    left: 60px;
    width: calc(100% - 75px);
    height: calc(100% - 125px);
    overflow: visible;
}

.book-list-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    -webkit-user-select: text;
    user-select: text;
}

.book-list-item-box {
    position: relative;
    top: 0px;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
}
</style>