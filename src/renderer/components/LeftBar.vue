<script setup>
import { ref, watch } from 'vue';
import EventBus from '../../common/EventBus';
const { ipcRenderer } = window.require('electron');
import StyleUtil from '../utils/readUtils/styleUtil.js'
const props = defineProps({
    currentBook: Object,
    currentStyle: Object,
});

const tabId = ref(0);
const noteList = ref([]);
const deleteButtonIndex = ref(null);
const $ = document.querySelector.bind(document)
const initData = () => {
    return new Promise((resolve, reject) => {
        ipcRenderer.once('db-get-all-notes-response', (event, res) => {
            if (res.success) {
                const categorizedNotes = res.data.reduce((acc, note) => {
                    if (!acc[note.chapter]) {
                        acc[note.chapter] = [];
                    }
                    acc[note.chapter].push(note);
                    return acc;
                }, {});
                noteList.value = categorizedNotes;
                resolve();  // 确保返回数据
            } else {
                reject(new Error('获取笔记失败'));
            }
        });
        ipcRenderer.send('db-get-notes', props.currentBook.id);
    });
}

const setTabId = (id) => {
    tabId.value = id;
    if (id == 1) {
        initData();
    }
}
const getNoteStyle = (note) => {
    let tempStyle = ""
    if (note.type == "underline") {
        tempStyle = "text-decoration-line: underline;text-decoration-color:" + note.color + ";";
    } else if (note.type == "squiggly") {
        tempStyle = "text-decoration-line: underline;text-decoration-style: wavy; text-decoration-color:" + note.color + ";";
    } else {
        tempStyle = "background-color:" + note.color + ";";
    }
    return tempStyle;
}

const showDeleteButton = (index) => {
    deleteButtonIndex.value = index;
}

const hideDeleteButton = (id) => {
    deleteButtonIndex.value = null;
}

const deleteNote = (note) => {
    ipcRenderer.once("db-delete-note-response", (event, res) => {
        if (res.success) {
            window.removeNote(note.cfi);
            initData();
        } else {
            console.log("删除失败");
        }
    });
    ipcRenderer.send('db-delete-note', note.id);
}

const goToCfi = (cfi) => {
    console.log("goToCfi", cfi);
    window.goToCfi(cfi);
}
const getNoteContent = (note) => {
    return note.note ? note.note.substring(0, 30) + (note.note.length > 20 ? '...' : '') : '无内容';
}

EventBus.on('updateLeftbarNotes', () => {
    initData();
});

EventBus.on('updateLeftbarStyle', () => {
    $('.sidebar-container').style.backgroundColor = StyleUtil.getStyle().backgroundColor;
});

</script>

<template>
    <div class="sidebar-container">
        <div id="side-bar-header">
            <img id="side-bar-cover" />
            <div>
                <h1 id="side-bar-title"></h1>
                <p id="side-bar-author"></p>
            </div>
        </div>
        <div class="tabContent">
            <div id="toc-view" v-show="tabId === 0"></div>
            <div id="noteList" v-show="tabId === 1">
                <div v-for="(notes, chapter) in noteList" :key="chapter">
                    <h3>{{ chapter }}</h3>
                    <ul>
                        <li v-for="(note, index) in notes" :key="index"
                            @mouseover="showDeleteButton(index)"
                            @mouseleave="hideDeleteButton(index)"
                            @click="goToCfi(note.cfi)">
                            <div v-if="deleteButtonIndex === index" class="delete-button-container">
                                <div id="note-time">
                                    {{ note.updateTime }}
                                </div>
                                <div class="btn-icon" @click="deleteNote(note)">
                                    <span class="iconfont icon-shanchu"></span>
                                </div>
                            </div>
                            <div class="note-content" :style="getNoteStyle(note)">
                                {{ getNoteContent(note) || '无内容' }}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div id="noteList" v-show="tabId === 2">
                书签列表
            </div>
        </div>
        <div class="sidebar-footer">
            <div class="iconfont-btn" :class="tabId === 0 ? 'selected' : ''" @click="setTabId(0)">
                <span class="iconfont icon-mulu"></span>
            </div>
            <div class="iconfont-btn" :class="tabId === 1 ? 'selected' : ''" @click="setTabId(1)">
                <span class="iconfont icon-anmuluchaolu-xianxing"></span>
            </div>
            <div class="iconfont-btn" :class="tabId === 2 ? 'selected' : ''" @click="setTabId(2)">
                <span class="iconfont icon-shuqian"></span>
            </div>
        </div>
    </div>
</template>

<style>
.sidebar-container {
    border-radius: 10px;
    z-index: 15;
    display: flex;
    height: 100%;
    min-width: 15rem;
    user-select: none;
    flex-direction: column;
    width: 15%;
    max-width: 45%;
    position: relative;
    background-color: var(--bg);
    box-shadow: 0 0 2px var(--bbc), 0 0 16px var(--bbc);
    color: var(--fc);
}

.flex-shrink-0 {
    flex-shrink: 0;
}

.sidebar-header {
    display: flex;
    padding-right: .5rem;
    padding-left: .375rem;
    justify-content: space-between;
    align-items: center;
    height: 2.75rem;
}

.sidebar-header-left {
    display: flex;
    align-items: center;
    column-gap: 2rem;
}

.sidebar-header-right {
    display: flex;
    justify-content: space-between;
    width: 70%;
    height: 70%;
    max-width: 8rem;
    align-items: center;
    min-width: 6rem;
}

.iconfont-btn {
    width: calc(100% / 3);
    min-height: 2rem;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
}

.iconfont-btn:hover,
.sidebar-footer .selected {
    cursor: pointer;
    border-color: transparent;
    background-color: var(--bbc);
    border-radius: 10px;
}

.iconfont-btn .iconfont {
    font-size: 1.3rem;
}

#side-bar-header {
    padding: 1rem;
    display: flex;
    border-bottom: 1px solid var(--bbc);
    align-items: center;
    color: var(--fc);
}

#toc-view {
    font-size: 14px;
    padding: .5rem;
    overflow-y: auto;
}

#toc-view li,
#toc-view ol {
    margin: 0;
    padding: 0;
    list-style: none;
}

#toc-view a,
#toc-view span {
    display: flex;
    align-items: center;
    border-radius: 6px;
    padding: 4px;
    margin: 4px 0;
    position: relative;
    padding-left: 24px;
}

#toc-view a {
    color: CanvasText;
    text-decoration: none;
    color: var(--fc);
}

#toc-view a:hover {
    background: var(--bbc);
}

#toc-view span {
    color: GrayText;
}

#toc-view svg {
    margin-inline-start: -18px;
    /* padding-inline-start: 2px;
    padding-inline-end: 6px; */
    fill: CanvasText;
    cursor: default;
    transition: transform .2s ease;
    opacity: .5;
}

#toc-view svg:hover {
    opacity: 1;
}

#toc-view [aria-current] {
    font-weight: bold;
    background: var(--bbc);
}

#toc-view [aria-expanded="false"] svg {
    margin-top: 1px;
    transform: rotate(-90deg);
}

#toc-view [aria-expanded="false"]+[role="group"] {
    display: none;
}

#side-bar-cover {
    height: 10vh;
    min-height: 60px;
    max-height: 180px;
    border-radius: 3px;
    border: 0;
    background: lightgray;
    box-shadow: 0 0 1px rgba(0, 0, 0, .1), 0 0 16px rgba(0, 0, 0, .1);
    margin-inline-end: 1rem;
}

#side-bar-cover:not([src]) {
    display: none;
}

#side-bar-title {
    margin: .5rem 0;
    font-size: inherit;
}

#side-bar-author {
    margin: .5rem 0;
    font-size: small;
    color: GrayText;
}

.sidebar-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 2.5rem;
    border-top: 1px solid var(--bbc);
    align-items: center;
    gap: 5px;
    padding-left: 5px;
    padding-right: 5px;
}

#noteList {
    padding: .5rem;
    height: 100%;
}

#noteList ul {
    margin: 0;
    padding: 0;
    list-style: none;
}

#noteList li {
    font-size: 1rem;
    padding: .5rem;
    border-radius: 4px;
    margin-bottom: .25rem;
    background-color: var(--bbc);
    display: flex;
    flex-direction: column;
}

#note-time {
    font-size: 0.8rem;
    font-style: italic;
    font-weight: bold;
}

.note-content {
    margin-bottom: .5rem;
}

.delete-button-container {
    display: flex;
    flex-direction: row;
    gap: 5px;
    justify-content: space-between;
    font-size: 0.5rem;
}

#noteList li:hover {
    background-color: var(--bbc);
    cursor: pointer;
}

.tabContent {
    overflow-y: auto;
    flex: 1;
}
</style>
