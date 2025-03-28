<script setup>
import { onMounted, reactive, ref, vShow } from 'vue';
import { useRoute } from 'vue-router';
import LeftBar from '../components/LeftBar.vue';
import ReadDialog from '../components/ReadDialog.vue';
import HeaderBar from '../components/HeaderBar.vue';
import FooterBar from '../components/FooterBar.vue';
import PopoversCtl from '../components/PopoversCtl.vue';
import StyleUtil from '../utils/readUtils/styleUtil.js'
import Config from '../utils/readUtils/config.js';
import { open } from '../libs/reader.js';
import EventBus from '../../common/EventBus';
const { ipcRenderer } = window.require('electron');
const route = useRoute();
const bookId = route.params.id;
const currentBook = ref({});
const bookStyle = reactive({});
const leftbarShow = ref(Config.getConfig().leftbarShow);
const $ = document.querySelector.bind(document)
const currentStyle = ref(StyleUtil.getStyle())
onMounted(() => {
    Object.assign(bookStyle, StyleUtil.getStyle());
    ipcRenderer.once('db-get-book-response', (event, items) => {
        currentBook.value = items.data[0];
        console.log(currentBook.value);
        if (currentBook.value.path) open(currentBook.value, bookStyle).catch(e => console.error(e))
    });
    ipcRenderer.send('db-get-book', bookId);

});

EventBus.on('updateBook', (bookRecord) => {
    const newBook = { ...currentBook.value, ...bookRecord };
    ipcRenderer.send('db-update-book', newBook);
});
const setLeftbarShow = (isShow) => {
    leftbarShow.value = isShow;
    Config.setConfig({ ...Config.getConfig(), ...{ leftbarShow: isShow } });
};

const readDialogShow = ref(false);

EventBus.on('read-dialog-show', (showHide) => {
    readDialogShow.value = showHide;
    showHide ? $('#dimming-overlay').classList.add('show') : $('#dimming-overlay').classList.remove('show');
});


</script>
<template>
    <PopoversCtl :bookId="bookId"></PopoversCtl>
    <div id="dimming-overlay" aria-hidden="true"></div>
    <div class="reader-page">
        <div class="reader-container">
            <LeftBar v-show="leftbarShow" :currentBook="currentBook" :currentStyle="currentStyle"> </LeftBar>
            <div class="reader-content">
                <div id="grid-cell">
                    <div class="foliate-viewer">
                        <HeaderBar :currentBook="currentBook" :setLeftbarShow="setLeftbarShow" :leftbarShow="leftbarShow"></HeaderBar>
                        <FooterBar />
                        <ReadDialog v-show="readDialogShow" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
:root {
    --active-bg: rgba(0, 0, 0, .05);

    /* 修改部分：定义 --button-bg-color 变量 */
    --button-bg-color: {
            {
            currentStyle.value.backgroundColor
        }
    }
}

.btn-icon {
    /* 确保宽度和高度相等 */
    width: 2rem;
    height: 2rem;
    min-height: 2rem;
    padding: 0;
    /* 移除左右内边距，避免影响圆形显示 */
    font-size: .875rem;
    line-height: 1em;
    font-weight: 600;
    background-color: white;
    border-radius: 50%;
    /* 保持选中的代码 */
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.active {
    filter: brightness(0.7);
}

.btn-text-icon {
    /* 确保宽度和高度相等 */
    width: 4rem;
    height: 2rem;
    padding: 0;
    /* 移除左右内边距，避免影响圆形显示 */
    font-size: .875rem;
    line-height: 2rem;
    font-weight: 600;
    background-color: white;
    border-radius: 5px;
    /* 保持选中的代码 */
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
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

/* 顶部章节名字显示 */
#chapter-title {
    font-size: 14px;
    align-items: center;
    display: flex;
    justify-content: center;
    min-width: 100px;
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

#bottom-bar .show {
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

.reader-page {
    border-radius: 10px;
}

.reader-container {
    height: 100dvh;
    display: flex;
}

.reader-content {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    flex-grow: 1;
    height: 100%;
    display: grid;
}

#grid-cell {
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    height: 100%;
    position: relative;
}

.foliate-viewer {
    width: 100%;
    height: 100%;
}
</style>
