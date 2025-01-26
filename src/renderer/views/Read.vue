<script setup>
import BottomBar from '../components/BottomBar.vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import localforage from 'localforage';
import { open } from '../libs/reader.js'
const { ipcRenderer } = window.require('electron');
const route = useRoute();
const bookKey = route.params.key;

onMounted(() => {
    localforage.getItem("books").then((result) => {
        let book = result.find(item => item.key === bookKey);
        if (book.path) open(book.path).catch(e => console.error(e))
    });
});

const handleClose = () => {
    ipcRenderer.send('window-close');
}



</script>

<template>
    <div id="dimming-overlay" aria-hidden="true"></div>
    <div id="side-bar">
        <!-- 左边目录 -->
        <div id="side-bar-header">
            <!-- 封面 -->
            <img id="side-bar-cover">
            <div>
                <!-- 书名 -->
                <h1 id="side-bar-title"></h1>
                <!-- 作者 -->
                <p id="side-bar-author"></p>
            </div>
        </div>

    </div>
    <div id="bottom-bar">
        <BottomBar />
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
    <div id="nav-bar" class="toolbar">
        <!-- 进度条 -->
        <input id="progress-slider" type="range" min="0" max="1" step="any" list="tick-marks">
        <datalist id="tick-marks"></datalist>

    </div>
    <div id="center">

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

/* .rightBtn {
    margin-right: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0.2;
    border: none;
    color: white;
    background-color: rgba(75, 75, 75, 1);
}

.rightBtn:hover {
    background-color: rgba(75, 75, 75, 0.5);
    opacity: 1;
}

.leftBtn {
    margin-left: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0.2;
    border: none;
    color: white;
    background-color: rgba(75, 75, 75, 1);
}

.leftBtn:hover {
    opacity: 1;
} */

#center {
    z-index: 4;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
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

#nav-bar {
    bottom: 0;
}

#progress-slider {
    flex-grow: 1;
    margin: 0 12px;
    visibility: hidden;
}

#side-bar {
    visibility: hidden;
    box-sizing: border-box;
    position: absolute;
    z-index: 20;
    top: 0;
    left: 0;
    height: 100%;
    width: 320px;
    transform: translateX(-320px);
    display: flex;
    flex-direction: column;
    background: Canvas;
    color: CanvasText;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .2), 0 0 40px rgba(0, 0, 0, .2);
    transition: visibility 0s linear 300ms, transform 300ms ease;
}

#side-bar.show {
    visibility: visible;
    transform: translateX(0);
    transition-delay: 0s;
}

#bottom-bar {
    visibility: hidden;
    box-sizing: border-box;
    position: absolute;
    z-index: 21;
    bottom: 0;
    width: 40%;
    height: 60%;
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

.menu-container {
    position: relative;
}

.menu,
.menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.menu {
    visibility: hidden;
    position: absolute;
    right: 0;
    background: Canvas;
    color: CanvasText;
    border-radius: 6px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .2), 0 0 16px rgba(0, 0, 0, .1);
    padding: 6px;
    cursor: default;
}

.menu.show {
    visibility: visible;
}

.menu li {
    padding: 6px 12px;
    padding-left: 24px;
    border-radius: 6px;
}

.menu li:hover {
    background: var(--active-bg);
}

.menu li[aria-checked="true"] {
    background-position: center left;
    background-repeat: no-repeat;
    background-image: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%223%22%2F%3E%3C%2Fsvg%3E');
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
