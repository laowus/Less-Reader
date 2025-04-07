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
    ipcRenderer.once('db-get-book-response', (event, items) => {
        currentBook.value = items.data[0];
        if (currentBook.value.path) open(currentBook.value, currentStyle.value).catch(e => console.error(e))
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

EventBus.on('set-theme', () => {
    console.log('改变样式');
    currentStyle.value = StyleUtil.getStyle();
    console.log(currentStyle.value);
});

</script>
<template>
    <PopoversCtl :bookId="bookId"></PopoversCtl>
    <div id="dimming-overlay" aria-hidden="true"></div>
    <div class="reader-page" :style="{ '--bbc': currentStyle.btnBgColor, '--bg': currentStyle.backgroundColor, '--fc': currentStyle.fontColor }">
        <div class="reader-container">
            <LeftBar v-show="leftbarShow" :currentBook="currentBook" :currentStyle="currentStyle"> </LeftBar>
            <div class="reader-content">
                <div id="grid-cell">
                    <div class="foliate-viewer">
                        <HeaderBar :currentBook="currentBook" :setLeftbarShow="setLeftbarShow" :leftbarShow="leftbarShow"></HeaderBar>
                        <FooterBar />
                    </div>
                </div>
            </div>
            <ReadDialog v-show="readDialogShow" />
        </div>
    </div>

</template>
<style>
.btn-icon {
    width: 2rem;
    height: 2rem;
    padding: 0;
    font-size: .875rem;
    line-height: 1em;
    font-weight: 600;
    background-color: var(--bbc);
    color: var(--fc);
    border-radius: 50%;
    cursor: pointer;
}

.btn-text-icon {
    width: 4rem;
    height: 2rem;
    padding: 0;
    font-size: .875rem;
    line-height: 2rem;
    font-weight: 600;
    background-color: var(--bg);
    border-color: transparent;
    cursor: pointer;
    color: var(--fc);
}

.btn-text-icon:hover,
.active {
    background-color: var(--bbc);
    border-radius: 10px;
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


/* .reader-page {
     border-radius: 20px;
} */

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
    overflow: hidden;
    width: 100%;
    height: 100%;
    position: relative;
}

.foliate-viewer {
    width: 100%;
    height: 100%;
}

/* 设置滚动条轨道 */
::-webkit-scrollbar-track {
    background: var(--fc);
    /* 滚动条轨道背景颜色 */
}

/* 设置滚动条滑块 */
::-webkit-scrollbar-thumb {
    background: var(--bbc);
    /* 滚动条滑块背景颜色 */
    border-radius: 4px;
    /* 滚动条滑块圆角 */
}

/* 鼠标悬停在滚动条滑块上的样式 */
::-webkit-scrollbar-thumb:hover {
    background: #555;
    /* 鼠标悬停时滚动条滑块背景颜色 */
}

.range {
    --c: var(--bbc);
    /* active color */
    --g: 1px;
    /* the gap */
    --l: 5px;
    /* line thickness*/
    --s: 20px;
    /* thumb size*/

    width: 90%;
    height: var(--s);
    /* needed for Firefox*/
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: none;
    cursor: pointer;
    overflow: hidden;
}

/* chromium */
.range::-webkit-slider-thumb {
    height: var(--s);
    aspect-ratio: 1;
    border-radius: 50%;
    box-shadow: 0 0 0 var(--l) inset var(--c);
    border-image: linear-gradient(90deg, var(--c) 50%, var(--fc) 0) 1/0 100vw/0 calc(100vw + var(--g));
    clip-path:
        polygon(0 calc(50% + var(--l)/2),
            -100vw calc(50% + var(--l)/2),
            -100vw calc(50% - var(--l)/2),
            0 calc(50% - var(--l)/2),
            0 0, 100% 0,
            100% calc(50% - var(--l)/2),
            100vw calc(50% - var(--l)/2),
            100vw calc(50% + var(--l)/2),
            100% calc(50% + var(--l)/2),
            100% 100%, 0 100%);
    -webkit-appearance: none;
    appearance: none;
}

/* Firefox */
.range::-moz-range-thumb {
    height: var(--s);
    width: var(--s);
    background: none;
    border-radius: 50%;
    box-shadow: 0 0 0 var(--l) inset var(--c);
    border-image: linear-gradient(90deg, var(--c) 50%, var(--fc) 0) 1/0 100vw/0 calc(100vw + var(--g));
    clip-path:
        polygon(0 calc(50% + var(--l)/2),
            -100vw calc(50% + var(--l)/2),
            -100vw calc(50% - var(--l)/2),
            0 calc(50% - var(--l)/2),
            0 0, 100% 0,
            100% calc(50% - var(--l)/2),
            100vw calc(50% - var(--l)/2),
            100vw calc(50% + var(--l)/2),
            100% calc(50% + var(--l)/2),
            100% 100%, 0 100%);
    -moz-appearance: none;
    appearance: none;
}
</style>
