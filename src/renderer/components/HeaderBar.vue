<script setup>
import { watch, defineProps, ref } from 'vue';
const { ipcRenderer } = window.require('electron');
import EventBus from '../../common/EventBus';
import Tts from '../utils/readUtils/tts';

const props = defineProps({
    currentBook: Object,
    setLeftbarShow: Function,
    leftbarShow: Boolean
})
const headerBook = ref({});

const handleClose = () => {
    console.log('handleClose', headerBook.value);

    if (Tts.isSpeaking) {
        Tts.stop();
    }
    ipcRenderer.send('close-reader-window', headerBook.value.id);
}

const handleMax = () => {
    ipcRenderer.send('window-max');
}
const handleMix = () => {
    ipcRenderer.send('window-min');
}

const openDialog = () => {
    EventBus.emit('read-dialog-show', true);
}

watch(() => props.currentBook, (newBook) => {
    headerBook.value = newBook;
    console.log('Current book has changed:', newBook);
}, { deep: true });
</script>
<template>
    <div class="header-bar">
        <div class="header-bar-left">
            <button class="tooltip" :title="props.leftbarShow ? '关闭侧边栏' : '打开侧边栏'" @click="setLeftbarShow(!props.leftbarShow)">
                <span class="iconfont" :class="props.leftbarShow ? 'icon-a-cebianlanfenleizhedie' : 'icon-a-fenleizhediecebianlan'"></span>
            </button>
        </div>
        <div class="chapter-title"> </div>
        <div class="header-bar-right">
            <button class="tooltip" title="字体和布局" @click="openDialog">
                <span class="iconfont icon-zitidaxiao"></span>
            </button>
            <button class="tooltip" title="笔记本">
                <span class="iconfont icon-biji"></span>
            </button>
            <button class="tooltip" title="最小化" @click="handleMix">
                <span class="iconfont icon-zuixiaohua"></span>
            </button>
            <button class="tooltip" title="最大化" @click="handleMax">
                <span class="iconfont icon-zuidahua_huaban1"></span>
            </button>
            <button class="tooltip" title="关闭" @click="handleClose">
                <span class="iconfont icon-guanbi"></span>
            </button>
        </div>
    </div>
</template>
<style>
.chapter-title {
    flex: 1;
    user-select: none;
    -webkit-app-region: drag;
    -webkit-user-select: none;
    text-align: center;
    margin: 0 auto;
    font-size: 14px;
    color: var(--fc);
}

.header-bar {
    position: absolute;
    top: 0;
    display: flex;
    height: 2.7rem;
    width: 100%;
    align-items: center;
    padding-left: 0.5rem;
    padding-right: 0rem;
    transition-duration: .3s;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    z-index: 12;
    vertical-align: top;
    flex-direction: space-between;
}

.header-bar-left {
    opacity: 0;
    height: 100%;
    align-items: center;
    display: flex;
    z-index: 20;
    flex-direction: row;
    gap: 0.5rem;
    background-color: var(--bg);
    justify-content: flex-start;
}

.header-bar-right {
    opacity: 0;
    align-items: center;
    height: 100%;
    display: flex;
    padding-right: 0px;
}

.header-bar-left:hover,
.header-bar-right:hover {
    opacity: 1;
    background-color: var(--bg);
}

.tooltip {
    margin-right: 0.5rem;
    width: 2rem;
    min-height: 2rem;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 0;
    background-color: var(--bg);
    color: var(--fc);
}

.tooltip:hover {
    cursor: pointer;
    border-color: transparent;
    background-color: var(--bbc);
    border-radius: 10px;
}

.tooltip .iconfont {
    font-size: 20px;
}

.header-title {
    display: flex;
    justify-content: center;
    align-items: center;
    inset: 0;
    position: absolute;
    pointer-events: none;
}

.line-clamp-1 {
    font-weight: 600;
    font-size: 1rem;
    line-height: 1rem;
    text-align: center;
    max-width: 50%;
    overflow: hidden;
}
</style>