<script setup>
import CommonContextMenu from './CommonContextMenu.vue';
import Highlight from './highlight.vue';
import EventBus from '../../common/EventBus';
import bookNoteUtil from '../utils/fileUtils/bookNoteUtil';
import BookNote from '../models/bookNote';
import { ref, reactive, toRaw } from 'vue';
import BookNoteUtil from '../utils/fileUtils/bookNoteUtil';

const props = defineProps({
    bookKey: String
})

const commonCtxMenuShow = ref(false);
const highlightShow = ref(false);
const ctxMenuPosStyle = reactive({ left: -999, top: -999, bottom: -999 })
const currentBookNote = reactive({})
const selectionRef = reactive({})

const showCommonCtxMenu = (selection) => {
    console.log(selection);
    selectionRef.value = selection;
    commonCtxMenuShow.value = true;
    let { x, y } = selection.pos.point;
    const { dir } = selection.pos;
    x *= window.innerWidth;
    y *= window.innerHeight;
    const left = x + 200 > window.innerWidth ? window.innerWidth - 200 : x;
    const bottom = dir == "up" ? window.innerHeight - y + 10 : null;
    const top = dir != "up" ? y + 10 : null;
    ctxMenuPosStyle.left = left;
    ctxMenuPosStyle.top = top;
    ctxMenuPosStyle.bottom = bottom;
}
const hideCommonCtxMenu = () => {
    commonCtxMenuShow.value = false;
}

const hideHighlight = () => {
    highlightShow.value = false;
}

const showHighlight = () => {
    highlightShow.value = true;
}

EventBus.on("commonCtxMenu-show", selection => {
    showCommonCtxMenu(selection);
})

EventBus.on("commonCtxMenu-hide", () => {
    hideCommonCtxMenu();
    hideHighlight();
})

EventBus.on("toggleUnderline", () => {
    highlightShow.value = !highlightShow.value;
})

EventBus.on("addNote", (typeColor) => {
    currentBookNote.value = new BookNote(props.bookKey, typeColor.color, selectionRef.value.text, typeColor.type, selectionRef.value.cfi);
    BookNoteUtil.addBookNote(toRaw(currentBookNote.value));//保存
    EventBus.emit("annotation-refresh");

    // hideCommonCtxMenu();
    // hideHighlight();
})

</script>
<template>
    <CommonContextMenu v-show="commonCtxMenuShow"
        :posStyle="ctxMenuPosStyle">
    </CommonContextMenu>
    <Highlight v-show="highlightShow"
        :posStyle="ctxMenuPosStyle">
    </Highlight>
</template>
<style></style>