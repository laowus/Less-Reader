<script setup>
import { onMounted, reactive, ref, vShow } from 'vue';
import { useRoute } from 'vue-router';
import LeftBar from '../components/LeftBar.vue';
import HeaderBar from '../components/HeaderBar.vue';
import BottomBar from '../components/BottomBar.vue';
import PopoversCtl from '../components/PopoversCtl.vue';
import StyleUtil from '../utils/readUtils/styleUtil.js'
import { open, setStyle } from '../libs/reader.js';
const { ipcRenderer } = window.require('electron');
import EventBus from '../../common/EventBus';
const route = useRoute();
const bookId = route.params.id;
const currentBook = ref({});
const bookStyle = reactive({});
const leftbarShow = ref(false);
const $ = document.querySelector.bind(document)
onMounted(() => {
    Object.assign(bookStyle, StyleUtil.getStyle());
    ipcRenderer.once('db-get-book-response', (event, items) => {
        currentBook.value = items.data[0];
        console.log("currentBook.value", currentBook.value);
        if (currentBook.value.path) open(currentBook.value.path, currentBook.value.id, currentBook.value.lastReadPosition, bookStyle).catch(e => console.error(e))
    });
    ipcRenderer.send('db-get-book', bookId);
});

EventBus.on('updateBook', (bookRecord) => {
    //获取当前的book
    const newBook = { ...currentBook.value, ...bookRecord };
    ipcRenderer.send('db-update-book', newBook);
});
const setLeftbarShow = (isShow) => {
    leftbarShow.value = isShow;
    isShow ? $('#dimming-overlay').classList.add('show') : $('#dimming-overlay').classList.remove('show')
};

onMounted(() => {
    $('#dimming-overlay').addEventListener('click', () => closeLeftBar())
});

const closeLeftBar = () => {
    setLeftbarShow(false);
}

</script>

<template>
    <PopoversCtl :bookId="bookId"></PopoversCtl>
    <div id="dimming-overlay" aria-hidden="true"></div>
    <div id="bottom-bar">
        <BottomBar :bookStyle="bookStyle" :setStyle="setStyle" />
    </div>
    <HeaderBar :currentBook="currentBook" :setLeftbarShow="setLeftbarShow"></HeaderBar>
    <LeftBar v-show="leftbarShow"> </LeftBar>

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
</style>
