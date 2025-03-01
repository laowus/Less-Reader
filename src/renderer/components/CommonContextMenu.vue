<script setup>
import { watch } from 'vue';
const props = defineProps({
    posStyle: Object
})
// 添加调试信息
watch(() => props.posStyle, (newVal) => {
    console.log("posStyle updated:", newVal);
}, { immediate: true });
</script>

<template>
    <div id="popup" :style="{ top: props.posStyle.top + 'px', left: props.posStyle.left + 'px', bottom: props.posStyle.bottom && props.posStyle.bottom + 'px' }">
        <div class="selection-buttons">
            <button class="my-2" title="复制">
                <span class="iconfont icon-fuzhi"></span>
            </button>
            <button class="my-2" title="划线">
                <span class="iconfont icon-huaxian"></span>
            </button>
            <button class="my-2" title="笔记">
                <span class="iconfont icon-biji"></span>
            </button>
            <button class="my-2" title="搜索">
                <span class="iconfont icon-sousuo"></span>
            </button>
        </div>
    </div>
</template>

<style>
#popup {
    width: 200px;
    height: 50px;
    z-index: 30;
    position: absolute;
    color: #e5e6e6;
    padding-left: 1rem;
    padding-right: 1rem;
    background-color: rgb(75 85 99);
    border-radius: .5rem;
    box-sizing: border-box;
    border: 0 solid #e5e7eb;
}

.selection-buttons {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.my-2 {
    display: flex;
    margin-top: .5rem;
    margin-bottom: .5rem;
    justify-content: center;
    padding: 0;
    align-items: center;
    width: 2rem;
    min-height: 2rem;
    height: 2rem;
    cursor: pointer;
    background-color: rgb(75 85 99);
    color: #e5e6e6;
    border: 0;
}

.my-2 .iconfont {
    font-size: 22px;
}
</style>