<script setup>
import CommonContextMenu from './CommonContextMenu.vue';
import { ref, computed } from 'vue';

const commonCtxMenuShow = ref(false);
const showCommonCtxMenu = () => {
    commonCtxMenuShow.value = true;
}
const hideCommonCtxMenu = () => {
    commonCtxMenuShow.value = false;
}
const ctxMenuPosStyle = reactive({ left: -999, top: -999 })


</script>
<template>
    <CommonContextMenu v-show="commonCtxMenuShow"
        :posStyle="ctxMenuPosStyle">
    </CommonContextMenu>
</template>
<style></style>