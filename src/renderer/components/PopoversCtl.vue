<script setup>
import CommonContextMenu from './CommonContextMenu.vue';
import Highlight from './Highlight.vue';
import EventBus from '../../common/EventBus';
import Note from '../models/Note';
import { noteRefresh } from '../libs/reader.js';
import { ref, reactive, toRaw, onMounted } from 'vue';

import NoteStyle from '../utils/readUtils/noteStyle';
const { ipcRenderer } = window.require('electron');

const props = defineProps({
    bookId: String
})

const commonCtxMenuShow = ref(false);
const highlightShow = ref(false);
const ctxMenuPosStyle = reactive({ left: -999, top: -999, bottom: -999 })
const currentNote = reactive({})
const selectionRef = reactive({})

const showCommonCtxMenu = (selection) => {
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
// 显示菜单
EventBus.on("commonCtxMenu-show", selection => {
    showCommonCtxMenu(selection);
})

EventBus.on("commonCtxMenu-hide", () => {
    hideCommonCtxMenu();
    hideHighlight();
})

EventBus.on("toggleUnderline", () => {
    addNote();
    //显示高亮框
    highlightShow.value = !highlightShow.value;
})

const addNote = () => {
    const noteStyle = NoteStyle.getNoteStyle();
    currentNote.value = new Note(0, props.bookId, noteStyle.color, selectionRef.value.text, noteStyle.type, selectionRef.value.cfi);
    ipcRenderer.once('db-insert-note-response', (event, res) => {
        if (res.success) {
            console.log(res.id);
            currentNote.value.updateId(res.id);
            console.log("修改后的当前note", currentNote);
            noteRefresh();
        } else {
            console.log("添加失败");
        }
    })
    ipcRenderer.send('db-insert-note', toRaw(currentNote.value));

    ipcRenderer.once('db-updateNote-response', (event, res) => {
        if (res.success) {
            console.log(res.id);
            noteRefresh();
        } else {
            console.log("修改失败");
        }
    })
}


</script>
<template>
    <CommonContextMenu v-show="commonCtxMenuShow"
        :posStyle="ctxMenuPosStyle">
    </CommonContextMenu>
    <Highlight v-show="highlightShow"
        :posStyle="ctxMenuPosStyle" :addNote="addNote">
    </Highlight>
</template>
<style></style>