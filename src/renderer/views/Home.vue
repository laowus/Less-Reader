<script setup>
import localforage from 'localforage';
import { ref, onMounted, toRaw, nextTick } from 'vue';
import { fetchMD5 } from '../utils/fileUtils/md5Util';
import BookUtil from '../utils/fileUtils/bookUtils';
import { ElMessage } from 'element-plus';
import BookListItem from '../components/BookListItem.vue';

const booklist = ref([]);
const selectedBooks = ref([]);
const filelistRef = ref([]);
const dialogFormVisible = ref(false);
const confirmVisible = ref(false);
let fileList = [];
let clickFilePath = "";

//上传
const getFiles = () => {
    if (fileList.length > 0) {
        fileList.map(async (file) => { await getMd5WithBrowser(file.raw) })
    }
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
        selectedBooks.value.forEach((item) => {
            return new Promise((resolve, reject) => {
                BookUtil.delBook(item);//删除文件
                const index = booklist.value.findIndex((book) => book.key === item.key);
                if (index !== -1) {
                    booklist.value.splice(index, 1);
                    ElMessage.success('删除' + item.name + '成功!');
                }
            });
        });
        const books = toRaw(booklist.value);
        localforage.setItem("books", books);
        selectedBooks.value = [];
        confirmVisible.value = false;
    }
}
//获取书籍md5
const getMd5WithBrowser = async (file) => {
    return new Promise(async (resolve, reject) => {
        const md5 = await fetchMD5(file);
        if (!md5) {
            ElMessage.error(' <<' + bookName + '>> md5失败!');
            return resolve();
        } else {
            try {
                await handleBook(file, md5);
            } catch (error) {
                console.log(error);
            }
            return resolve();
        }
    })
}
// 处理书籍
// 1.判断是否存在,每本书都有一个特定的md5,假如md5和文件大小一致,即为重复书籍
// 2. 不重复, 获取书籍信息,书名/作者/封面cover(封面cover为base64的字符串)等
// 
const handleBook = (file, md5) => {
    let extension = (file.name).split(".").reverse()[0].toLocaleLowerCase();
    let bookName = file.name.substr(0, file.name.length - extension.length - 1);
    let result;
    return new Promise((resolve, reject) => {
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
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async (e) => {
                if (!e.target) {
                    ElMessage.error(' <<' + bookName + '>> 导入失败!');
                    return resolve();
                }
                let reader = new FileReader();
                reader.onload = async (event) => {
                    const file_content = event.target.result;
                    try {
                        result = await BookUtil.generateBook(bookName, extension, md5, file.size, file.path || clickFilePath, file);
                    } catch (error) {
                        console.log(error);
                        throw error;
                    }
                    clickFilePath = "";
                    if (result === "get_metadata_error") {
                        ElMessage.error('导入 <<' + bookName + '>> 失败!');
                        return resolve();
                    }
                    await handleAddBook(result, file_content);
                    return resolve();
                }
                reader.readAsArrayBuffer(file);
            }
        }
    })
}
// 添加数据操作. 复制书籍到用户文件夹/upload/book下
// 复制数据信息到IndexDb中
const handleAddBook = (book, buffer) => {
    return new Promise((resolve, reject) => {
        BookUtil.addBook(book.key, buffer);//复制文件
        booklist.value.push(book);
        const books = toRaw(booklist.value);
        localforage.setItem("books", books).then(() => {
            ElMessage.success('导入 <<' + book.name + '>> 成功!');
            filelistRef.value = []
            dialogFormVisible.value = false
        }).catch(() => {
            ElMessage.error('导入 <<' + book.name + '>> 失败!');
        });
        return resolve();
    })
}
//选中 书籍
const selectBook = (isSelected, book) => {
    isSelected ? selectedBooks.value.push(book) : unSelectBook(book);
}
//取消选中
const unSelectBook = (book) => {
    selectedBooks.value = selectedBooks.value.filter((item) => item !== book);
}
const loadContent = () => {
    localforage.getItem("books").then((books) => {
        booklist.value = books ? books : [];
    });
}

onMounted(() => {
    loadContent()
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
                    <span class="icon-search header-search-icon"></span>
                </span>
            </div>

        </div>
        <div class="import-from-local">
            <el-button type="success" @click="dialogFormVisible = true">
                <el-icon class="el-icon--right">
                    <Upload />
                </el-icon> 导入书籍
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
    <div class="book-list-header">
        <div class="booklist-manage-container"></div>
        <div>
            <div class="book-list-view">
                <div class="card-list-mode">
                    <span data-tooltip-id="my-tooltip" data-tooltip-content="卡片模式"><span class="icon-grid"></span></span>
                </div>
                <div class="card-list-mode" style="opacity: 0.5;"><span data-tooltip-id="my-tooltip" data-tooltip-content="列表模式"><span class="icon-menu"></span></span></div>
                <div class="card-list-mode" style="opacity: 0.5;"><span data-tooltip-id="my-tooltip" data-tooltip-content="封面模式"><span class="icon-cover"></span></span></div>
            </div>
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