<script setup>
import BottomBar from '../components/BottomBar.vue';
import SelectBar from '../components/SelectBar.vue';
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import localforage from 'localforage';
import RecordLocation from '../utils/readUtils/recordLocation.js';
import StyleUtil from '../utils/readUtils/styleUtil.js'
import { open, setStyle } from '../libs/reader.js';
const { ipcRenderer } = window.require('electron');
const route = useRoute();
const bookKey = route.params.key;
let detail;
const bookStyle = reactive({});
const showSelectMenu = ref(false);
onMounted(() => {
    Object.assign(bookStyle, StyleUtil.getStyle());
    detail = RecordLocation.getCfi(bookKey);
    localforage.getItem("books").then((result) => {
        let book = result.find(item => item.key === bookKey);
        if (book.path) open(book.path, bookKey, detail.cfi, bookStyle).catch(e => console.error(e))
    });
});

const handleClose = () => {
    ipcRenderer.send('window-close');
}

</script>

<template>
    <dialog id="footnote-dialog">
        <div>
            <main></main>
        </div>
    </dialog>
    <SelectBar v-if="showSelectMenu" id="select-menu" />
    <div id="dimming-overlay" aria-hidden="true"></div>
    <div id="bottom-bar">
        <BottomBar :bookStyle="bookStyle" :setStyle="setStyle" />
    </div>
    <div id="header-bar" class="toolbar">
        <!-- 拖动位置 -->
        <div class="title-bar-dragger" id="chapter-title"></div>
        <div id="menu-button" class="menu-container">
            <button aria-label="Show settings" aria-haspopup="true" @click="handleClose">
                <el-icon :size="20">
                    <Close />
                </el-icon>
            </button>
        </div>
    </div>
</template>

<style>
:root {
    --active-bg: rgba(0, 0, 0, .05);
}

@supports (color-scheme: light dark) {
    @media (prefers-color-scheme: dark) {
        :root {
            --active-bg: rgba(255, 255, 255, .1);
        }
    }
}

html {
    height: 100%;
}

body {
    margin: 0 auto;
    height: 100%;
    font: menu;
    font-family: system-ui, sans-serif;
}

.icon {
    fill: none;
    stroke: currentcolor;
    stroke-width: 3px;
}

#footnote-dialog {
    padding: 0;
    width: auto;
    height: auto;
    max-width: 80vw;
    max-height: 80vh;
    min-width: 200px;
    min-height: 100px;
    border-radius: 15px;
    border: 2px solid grey;
    user-select: none;
}

#footnote-dialog div {
    display: flex;
    flex-direction: column;
    height: 100%;
}

#footnote-dialog main {
    overflow: auto;
    flex: 1;
}

.empty-state-icon {
    margin: auto;
}

.toolbar {
    box-sizing: border-box;
    position: absolute;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 48px;
    padding: 6px;
    transition: opacity 250ms ease;
    visibility: hidden;
}

.toolbar button {
    padding: 3px;
    border-radius: 6px;
    background: none;
    border: 0;
    color: GrayText;
}

.title-bar-dragger {
    flex: 1;
    height: 100%;
    user-select: none;
    -webkit-app-region: drag;
    -webkit-user-select: none;
}

.toolbar button:hover {
    background: rgba(0, 0, 0, .1);
    color: currentcolor;
}

#header-bar {
    top: 0;
}

/* 顶部章节名字显示 */
#chapter-title {
    font-size: 14px;
    align-items: center;
    display: flex;
    justify-content: center;
}

#bottom-bar {
    visibility: hidden;
    box-sizing: border-box;
    position: absolute;
    z-index: 21;
    bottom: 0;
    width: 40%;
    height: auto;
    max-height: 80%;
    margin: 0 auto;
    left: 0;
    right: 0;
    display: flex;
    color: CanvasText;
}

#bottom-bar.show {
    visibility: visible;
    transform: translateY(0);
    transition-delay: 0s;
}

#dimming-overlay {
    visibility: hidden;
    position: fixed;
    z-index: 20;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .2);
    opacity: 0;
    transition: visibility 0s linear 300ms, opacity 300ms ease;
}

#dimming-overlay.show {
    visibility: visible;
    opacity: 1;
    transition-delay: 0s;
}

#side-bar-header {
    padding: 1rem;
    display: flex;
    border-bottom: 1px solid rgba(0, 0, 0, .1);
    align-items: center;
}


.popover {
    background: Canvas;
    color: CanvasText;
    border-radius: 6px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .2), 0 0 16px rgba(0, 0, 0, .1), 0 0 32px rgba(0, 0, 0, .1);
}

.popover-arrow-down {
    fill: Canvas;
    filter: drop-shadow(0 -1px 0 rgba(0, 0, 0, .2));
}

.popover-arrow-up {
    fill: Canvas;
    filter: drop-shadow(0 1px 0 rgba(0, 0, 0, .2));
}
</style>
