<script setup>
import CommonContextMenu from './CommonContextMenu.vue';
import EventBus from '../../common/EventBus';
import { ref, reactive } from 'vue';

const commonCtxMenuShow = ref(false);
const ctxMenuPosStyle = reactive({ left: -999, top: -999, bottom: -999 })

const showCommonCtxMenu = (selection) => {
    commonCtxMenuShow.value = true;
    let { x, y } = selection.pos.point;
    const { dir } = selection.pos.dir;
    x *= window.innerWidth;
    y *= window.innerHeight;
    console.log(x, y);
    const left = x + 200 > window.innerWidth ? window.innerWidth - 200 : x;
    const bottom = dir == "up" ? window.innerHeight - y : null;
    const top = dir != "up" ? y : null;
    ctxMenuPosStyle.left = left;
    ctxMenuPosStyle.top = top;
    ctxMenuPosStyle.bottom = bottom;
}
const hideCommonCtxMenu = () => {
    commonCtxMenuShow.value = false;
}


EventBus.on("commonCtxMenu-show", selection => {
    showCommonCtxMenu(selection);
    console.log(selection);
})

EventBus.on("commonCtxMenu-hide", () => {
    hideCommonCtxMenu();
})
</script>
<template>
    <CommonContextMenu v-show="commonCtxMenuShow"
        :posStyle="ctxMenuPosStyle">
    </CommonContextMenu>
</template>
<style></style>