<script setup>
const { ipcRenderer } = window.require('electron');
const handleClose = () => {
    ipcRenderer.send('window-close');
}
const props = defineProps({
    currentBook: Object,
    setLeftbarShow: Function,
    leftbarShow: Boolean
})

</script>
<template>
    <div class="chapter-title"> </div>
    <div class="header-bar">
        <div class="sidebar-bookmark-toggeler">
            <button class="tooltip" :title="props.leftbarShow ? '关闭侧边栏' : '打开侧边栏'" @click="setLeftbarShow(!props.leftbarShow)">
                <span class="iconfont" :class="props.leftbarShow ? 'icon-a-cebianlanfenleizhedie' : 'icon-a-fenleizhediecebianlan'"></span>
            </button>
            <button class="tooltip" data-tip="书签">
                <span class="iconfont icon-tianjiashuqian"></span>
            </button>
        </div>
        <!-- <div class="header-title">
            <h2 class="line-clamp-1">
                {{ props.currentBook.name }}
            </h2>
        </div> -->
        <div class="header-control">
            <button class="tooltip" title="字体和布局">
                <span class="iconfont icon-font-size"></span>
            </button>
            <button class="tooltip" title="笔记本">
                <span class="iconfont icon-biji"></span>
            </button>
            <button class="tooltip1" title="最小化">
                <span class="iconfont icon-zuixiaohua"></span>
            </button>
            <button class="tooltip1" title="最大化">
                <span class="iconfont icon-zuidahua_huaban1"></span>
            </button>
            <button class="tooltip1" title="关闭" @click="handleClose">
                <span class="iconfont icon-guanbi"></span>
            </button>
        </div>
    </div>
</template>
<style>
.chapter-title {
    position: absolute;
    top: 10px;
    width: 50%;
    /* 调整宽度以适应居中 */
    height: 2.75rem;
    left: 25%;
    /* 调整 left 值以居中 */
    right: 25%;
    /* 调整 right 值以居中 */
    margin: 0 auto;
    /* 水平居中 */
    font-size: 14px;
    color: grey;
    text-align: center;
    /* 文本居中 */
    z-index: 11;
    user-select: none;
    -webkit-app-region: drag;
    -webkit-user-select: none;
}

.header-bar {
    position: absolute;
    top: 0;
    display: flex;
    height: 2.7rem;
    width: 100%;
    align-items: center;
    padding-left: 1rem;
    padding-right: 1rem;
    opacity: 0;
    transition-duration: .3s;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    z-index: 10;
    vertical-align: top;
}

.header-bar:hover {
    opacity: 1;
    background: white;
}

.sidebar-bookmark-toggeler {
    opacity: 1;
    height: 100%;
    align-items: center;
    display: flex;
    z-index: 20;
}

.tooltip {
    margin-right: 1rem;
    width: 2rem;
    min-height: 2rem;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 0;
    background-color: transparent;
}

.tooltip:hover {
    background-color: gainsboro;
    cursor: pointer;
    border-radius: 10px;
}

.tooltip .iconfont {
    font-size: 20px;
}

.tooltip1 {
    margin-right: 1rem;
    width: 1.2rem;
    height: 1.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 0;
    background-color: transparent;
    cursor: pointer;
    border-radius: 50%;
    background-color: gainsboro;
}

.tooltip1 .iconfont {
    font-size: 18px;
}

.tooltip1:hover {
    cursor: pointer;
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

.header-control {
    z-index: 20;
    align-items: center;
    height: 100%;
    display: flex;
    margin-left: auto;
    padding-right: 20px;
}
</style>