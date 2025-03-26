<script setup>
import { reactive } from 'vue';
import NoteStyle from '../utils/readUtils/noteStyle';
import EventBus from '../../common/EventBus';
const props = defineProps({
    posStyle: Object,
    addNote: Function
})

const currentStyle = reactive(NoteStyle.getNoteStyle());
const colors = NoteStyle.colors;
const types = NoteStyle.types;

const setColor = (index) => {
    currentStyle.color = colors[index];
    console.log(currentStyle);
    NoteStyle.setNoteStyle(currentStyle);
    props.addNote();
}
const setType = (index) => {
    currentStyle.type = types[index];
    NoteStyle.setNoteStyle(currentStyle);
    props.addNote();
}

EventBus.on('changeNoteStyle', (noteStyle) => {
    currentStyle.value = noteStyle;
});

</script>

<template>
    <div id="highlight-options"
        :style="{ top: props.posStyle.top && props.posStyle.top + 50 + 'px', left: props.posStyle.left + 'px', bottom: props.posStyle.bottom && props.posStyle.bottom + 50 + 'px' }">
        <div class="btns">
            <button class="btn-class" @click="setType(0)">
                <div class="astyle" :style="{ 'backgroundColor': currentStyle.color }">A</div>
            </button>
            <button class="btn-class" @click="setType(1)">
                <div class="btn-underlined" :style="{ 'text-decoration-color': currentStyle.color }">A</div>
            </button>
            <button class="btn-class" @click="setType(2)">
                <div class="btn-underlined1" :style="{ 'text-decoration-color': currentStyle.color }">A</div>
            </button>
        </div>
        <div class="btnsColor">
            <button v-for="(color, index) in colors"
                :key="index"
                class="btn-color"
                :style="{ backgroundColor: color }"
                @click="setColor(index)">
                <span v-if="colors[index] === currentStyle.color" class="iconfont icon-dagou2"></span>
            </button>
        </div>
    </div>
</template>

<style>
#highlight-options {
    z-index: 30;
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: space-between;
    width: 260px;
    height: 50px;
}

.btns {
    display: flex;
    gap: 0.5rem;
    height: 32px;
}

.btn-class {
    width: 32px;
    height: 32px;
    min-height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 9999px;
    background-color: rgb(55 65 81);
    padding: 0;
    border: 0 solid #e5e7eb;
}

.astyle {
    width: 18px;
    height: 16px;
    background-color: rgb(193, 195, 199);
}

.btn-underlined {
    color: rgb(193, 195, 199);
    text-decoration-thickness: 2px;
    text-decoration-color: #d1d5db;
    text-decoration-line: underline;

}

.btn-underlined1 {
    color: rgb(193, 195, 199);
    text-decoration-thickness: 2px;
    text-decoration-color: #f87171;
    text-decoration-line: underline;
    text-decoration-style: wavy;
}

.btnsColor {
    display: flex;
    gap: 0.5rem;
    height: 32px;
    border-radius: 1.5rem;
    background-color: rgb(55 65 81);
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    justify-content: center;
    align-items: center;
}

.btn-color {
    width: 18px;
    height: 18px;
    padding: 0;
    border-radius: 9999px;
    box-sizing: border-box;
    border: 0 solid #e5e7eb;
}

.icon-dagou2 {
    font-weight: bold;
    font-size: 12px;
}
</style>
