<script setup>
import CommonContextMenu from './CommonContextMenu.vue';
import Highlight from './Highlight.vue';
import EventBus from '../../common/EventBus';
import Note from '../models/Note';
import { ref, reactive, toRaw } from 'vue';

import NoteStyle from '../utils/readUtils/noteStyle';
const { ipcRenderer } = window.require('electron');

const props = defineProps({
    bookId: String
})
const commonCtxMenuShow = ref(false);
const highlightShow = ref(false);
const ctxMenuPosStyle = reactive({ left: -999, top: -999, bottom: -999 });
const currentNote = ref({});
const selectionRef = reactive({});
const highlightRef = ref(null);
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

const showAllMenu = (note) => {
    console.log("showAllMenu", note);
    new Promise((resolve, reject) => {
        getNoteByCfi(note.annotation.value);
        console.log("currentNote", currentNote.value);
        resolve();
    }).then(() => {
        const selection = {
            pos: note.pos,
            text: note.annotation.note,
            cfi: note.annotation.value
        }
        showCommonCtxMenu(selection);
        showHighlight();
        EventBus.emit('changeNoteStyle', { color: note.color, type: note.type });
    });
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
    currentNote.value = {};
})

EventBus.on("toggleUnderline", () => {
    addNote();
    toggleHighlight();
})

EventBus.on("showNote", (note) => {
    console.log("showNote", note)
    showAllMenu(note);
})

const toggleHighlight = () => {
    highlightShow.value = !highlightShow.value;
}

const addNote = () => {
    const noteStyle = NoteStyle.getNoteStyle();
    currentNote.value = new Note(0, props.bookId, noteStyle.color, selectionRef.value.text, noteStyle.type, selectionRef.value.cfi, selectionRef.value.chapter);
    ipcRenderer.once('db-insert-note-response', (event, res) => {
        if (res.success) {
            console.log(res.id);
            currentNote.value = res.data;
            updateLeftbarNotes();
            window.addAnnotation(currentNote.value);
        } else {
            console.log("添加失败");
        }
    })
    ipcRenderer.send('db-insert-note', toRaw(currentNote.value));

    ipcRenderer.once('db-updateNote-response', (event, res) => {
        if (res.success) {
            currentNote.value = res.data;
            updateLeftbarNotes();
            window.addAnnotation(currentNote.value);
        } else {
            console.log("修改失败");
        }
    })
}

const getNoteByCfi = (cfi) => {
    ipcRenderer.once('db-get-note-by-cfi-response', (event, res) => {
        if (res.success) {
            console.log(res.data);
            currentNote.value = res.data;
        } else {
            console.log("获取失败");
        }
    })
    ipcRenderer.send('db-get-book-by-cfi', cfi);
}

const updateLeftbarNotes = () => {
    EventBus.emit('updateLeftbarNotes');
}

</script>
<template>
    <CommonContextMenu v-show="commonCtxMenuShow"
        :posStyle="ctxMenuPosStyle" :currentNote="currentNote" :toggleHighlight="toggleHighlight">
    </CommonContextMenu>
    <Highlight v-show="highlightShow"
        :posStyle="ctxMenuPosStyle" :addNote="addNote" ref="highlightRef">
    </Highlight>
</template>
<style></style>