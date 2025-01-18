<script setup>
const props = defineProps({
    book: Object
})
</script>
<template>
    <div class="empty-cover">
        <div class="cover-banner" :style="{
            backgroundColor: book.format === 'EPUB'
                ? 'rgba(33, 165, 241,1)'
                : book.format === 'MOBI'
                    ? 'rgba(255, 108, 110,1)'
                    : book.format === 'AZW3' || book.format === 'AZW'
                        ? ' #ff9900'
                        : 'rgba(104, 103, 209, 1)'
        }">
            {{ book.format }}
        </div>
        <div class="cover-title">{{ book.name }}</div>
        <div class="cover-footer">Less Reader</div>
    </div>
</template>
<style>
.empty-cover {
    width: 105px;
    height: 137px;
    transform-origin: 0% 0%;
}

.cover-banner {
    float: left;
    width: 90px;
    height: 30px;
    margin-top: 10px;
    line-height: 30px;
    font-weight: 500;
    text-indent: 10px;
    font-size: 15px;
}

.cover-title {
    float: left;
    font-size: 15px;
    font-weight: 500;
    opacity: 0.9;
    width: 90%;
    height: 54px;
    text-align: left;
    line-height: 18px;
    position: relative;
    top: 10px;
    margin-left: 5px;
    word-wrap: break-word;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
}

.cover-footer {
    width: 100%;
    text-align: center;
    font-size: 13px;
    opacity: 0.3;
    position: absolute;
    bottom: 6px;
    font-weight: bolder;
}
</style>