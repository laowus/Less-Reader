<script setup>
import { ref } from 'vue';
import EmptyCover from './EmptyCover.vue'
import BookUtil from '../utils/fileUtils/bookUtils'

const props = defineProps({
    book: Object,
    selectedBooks: Array,
    isSelected: Boolean,
    hovered: Boolean,
    selectChangedFn: Function,
})
//处理hover
const isHovered = ref(props.hovered)
const setHovered = (value) => {
    isHovered.value = value
}
const toggleHover = () => {
    setHovered(!isHovered.value)
}
//处理选择
const isSelected = ref(props.isSelected)
const toggleSelect = (event) => {
    const { selectChangedFn } = props
    setSelected(!isSelected.value);
    if (selectChangedFn) selectChangedFn(isSelected.value, props.book);
    event?.stopPropagation();
}
const setSelected = (value) => {
    isSelected.value = value
}
const openBook = () => {
    //如果被选中,就阻止
    if (isSelected.value) {
        toggleSelect();
        return;
    }
    BookUtil.RedirectBook(props.book);
}

</script>
<template>
    <div class="book-list-item">
        <div class="book-item-cover" @click="openBook()" :onmouseenter="toggleHover" :onmouseleave="toggleHover">
            <div class="book-item-image">
                <img v-lazy="book.cover" alt=""
                    class="lazy-image book-item-image" v-show="book.cover" />
                <EmptyCover :book="book" v-show="book.cover === ''" />
            </div>
            <span v-show="selectedBooks.length > 0 || isHovered" class="iconfont icon-dagou book-selected-icon"
                :style="{ color: isSelected ? 'red' : 'rgb(238, 238, 238)' }" @click="toggleSelect($event)">
            </span>
        </div>
        <p class="book-item-title"> {{ book.name }}</p>
        <div class="reading-progress-icon">
            <div style="position: relative; left: 4px"></div>
        </div>
    </div>
</template>

<style>
.book-item-image,
.book-item-cover,
.book-cover,
.detail-cover,
.detail-cover-background-container,
.book-cover-item-cover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.18);
    width: 100%;
    height: 100%;
    position: relative
}

.book-item-list {
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.18);
}

.book-list-item {
    width: 133px;
    height: 192px;
    float: left;
    overflow: hidden;
    position: relative;
}

.book-item-cover {
    width: 105px;
    height: 137px;
    opacity: 1;
    margin: 10px 15px 5px 15px;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    justify-content: center;
    border-radius: 2px;
}


.book-item-image {
    border-radius: 2px;
}


.book-selected-icon {
    position: absolute;
    bottom: 5px;
    right: 5px;
    font-size: 20px;
    color: #f87356;
    cursor: pointer;
    z-index: 2;
}

.book-item-title {
    width: 80%;
    margin-left: 10%;
    /* margin-bottom: 5px; */
    height: 31px;
    font-size: 12px;
    line-height: 15px;
    opacity: 1;
    text-align: center;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    position: relative;
}

.reading-progress-icon {
    display: inline-block;
    margin-left: 10px;
    border-radius: 50%;
    font-size: 12px;
    /* line-height: 31px; */
    cursor: pointer;
}



.book-more-action {
    /* position: absolute;
          bottom: 23px;
          right: 17px; */
    transform: rotate(90deg);
    float: right;
    font-size: 14px;
    cursor: pointer;
    margin-right: 14px;
    margin-top: 4px;
    opacity: 0.8;
}


@keyframes fade-in {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }

    100% {
        opacity: 1;
        transform: translateY(0px);
    }
}


@keyframes slide-down {
    0% {
        transform: translateY(-20px);
        opacity: 0;
    }

    100% {
        transform: translateY(0px);
        opacity: 1;
    }
}

@keyframes slide-down-rotate {
    0% {
        transform: translateY(-20px);
        opacity: 0;
    }

    100% {
        transform: translateY(0px);
        opacity: 1;
    }
}

@keyframes slide-up {
    0% {
        transform: translateY(20px);
        opacity: 0;
    }

    100% {
        transform: translateY(0px);
        opacity: 1;
    }
}
</style>
