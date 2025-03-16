<script setup>
import EventBus from '../../common/EventBus';
const { ipcRenderer } = window.require('electron');
const props = defineProps({
    posStyle: Object,
    currentNote: Object,
    toggleHighlight: Function
})

const toggleUnderline = () => {
    if (props.currentNote.id > 0) {
        ipcRenderer.once("db-delete-note-response", (event, res) => {
            if (res.success) {
                console.log("db-delete-note-response", res.id);
                window.removeNote(props.currentNote.cfi);
                EventBus.emit('updateLeftbarNotes');
                EventBus.emit('commonCtxMenu-hide');
            } else {
                console.log("删除失败");
            }
        });
        ipcRenderer.send("db-delete-note", props.currentNote.id);
    } else {
        EventBus.emit("toggleUnderline");
    }
}

</script>

<template>
    <div id="popup" :style="{ top: props.posStyle.top && props.posStyle.top + 'px', left: props.posStyle.left + 'px', bottom: props.posStyle.bottom && props.posStyle.bottom + 'px' }">
        <div class="selection-buttons">
            <button class="my-2" title="复制">
                <span class="iconfont icon-fuzhi"></span>
            </button>
            <button class="my-2" title="划线" @click="toggleUnderline">
                <span class="iconfont " :class="props.currentNote?.id > 0 ? 'icon-shanchu' : 'icon-highlight-outlined1'"></span>
            </button>
            <button class="my-2" title="笔记">
                <span class="iconfont icon-biji"></span>
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