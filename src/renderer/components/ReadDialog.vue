<script setup>
import { ref } from 'vue';
import EventBus from '../../common/EventBus';
import StyleUtil from '../utils/readUtils/styleUtil'
const tabindex = ref(0)
// 新增颜色和背景设置数组
const colorOptions = StyleUtil.themes;
const currentThemeIndex = ref(StyleUtil.getThemeIndex());
console.log(currentThemeIndex.value);

EventBus.on('showDialog', (showhide) => {
    dialogRef.value.showModal();
})
const closeDialog = () => {
    EventBus.emit('read-dialog-show', false);
}
const currentStyle = ref(StyleUtil.getStyle())

const sizejiajian = (isJia) => {
    if (currentStyle.value.fontSize <= 10 && !isJia || currentStyle.value.fontSize >= 20 && isJia) {
        return;
    }
    isJia ? currentStyle.value.fontSize++ : currentStyle.value.fontSize--;
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
}
const weightjiajian = (isJia) => {
    console.log(currentStyle.value.fontWeight);
    if (currentStyle.value.fontWeight <= 100 && !isJia || currentStyle.value.fontWeight >= 600 && isJia) {
        console.log("不执行");
        return;
    }
    isJia ? currentStyle.value.fontWeight += 100 : currentStyle.value.fontWeight -= 100;
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
}
const duanjiajian = (isJia) => {
    console.log(currentStyle.value.paragraphSpacing);
    if (currentStyle.value.paragraphSpacing <= 0 && !isJia || currentStyle.value.paragraphSpacing >= 4 && isJia) {
        return;
    }
    isJia ? currentStyle.value.paragraphSpacing += 0.5 : currentStyle.value.paragraphSpacing -= 0.5;
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
}
const linejiajian = (isJia) => {
    console.log(currentStyle.value.lineHeight);
    if (currentStyle.value.lineHeight <= 1 && !isJia || currentStyle.value.lineHeight >= 3 && isJia) {
        return;
    }
    if (isJia) {
        currentStyle.value.lineHeight = Number((currentStyle.value.lineHeight + 0.1).toFixed(1));
    } else {
        currentStyle.value.lineHeight = Number((currentStyle.value.lineHeight - 0.1).toFixed(1));
    }
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
}
const letterjiajian = (isJia) => {
    console.log(currentStyle.value.letterSpacing);
    if (currentStyle.value.letterSpacing <= 0 && !isJia || currentStyle.value.letterSpacing >= 4 && isJia) {
        return;
    }
    if (isJia) {
        currentStyle.value.letterSpacing = Number((currentStyle.value.letterSpacing + 0.1).toFixed(1));
    } else {
        currentStyle.value.letterSpacing = Number((currentStyle.value.letterSpacing - 0.1).toFixed(1));
    }
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
}
const wordjiajian = (isJia) => {
    console.log(currentStyle.value.letterSpacing);
    if (currentStyle.value.wordSpacing <= 0 && !isJia || currentStyle.value.wordSpacing >= 8 && isJia) {
        return;
    }
    if (isJia) {
        currentStyle.value.wordSpacing = Number((currentStyle.value.wordSpacing + 0.5).toFixed(1));
    } else {
        currentStyle.value.wordSpacing = Number((currentStyle.value.wordSpacing - 0.5).toFixed(1));
    }
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
}

const tijiajian = (isJia) => {
    if (currentStyle.value.textIndent <= 0 && !isJia || currentStyle.value.textIndent >= 4 && isJia) {
        return;
    }
    isJia ? currentStyle.value.textIndent += 1 : currentStyle.value.textIndent -= 1;
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
}

const setJustify = () => {
    currentStyle.value.justify = !currentStyle.value.justify;
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
}

const setHyphenate = () => {
    currentStyle.value.hyphenate = !currentStyle.value.hyphenate;
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
}

const setWritingMode = (writingMode) => {
    currentStyle.value.writingMode = writingMode;
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
}

const setTabId = (id) => {
    tabindex.value = id;
}

const setTheme = (index) => {
    currentThemeIndex.value = index;
    const currentTheme = StyleUtil.themes[index];
    console.log(currentTheme);
    currentStyle.value.fontColor = currentTheme.fontColor;
    currentStyle.value.backgroundColor = currentTheme.backgroundColor;
    StyleUtil.setStyle(currentStyle.value);
    console.log("setTheme", currentStyle.value);
    window.setStyle(currentStyle.value);
}
</script>
<template>
    <dialog id="dialog" class="modal">
        <div class="setting-content">
            <div class="dialog-header">
                <div class="btn-title">
                    <button class="btn-icon" :class="tabindex == 0 ? 'active' : ''" @click="setTabId(0)">
                        <span class="iconfont  icon-zitidaxiao"></span>
                        字体
                    </button>
                    <button class="btn-icon" :class="tabindex == 1 ? 'active' : ''" @click="setTabId(1)">
                        <span class="iconfont  icon-layoutForm"></span>
                        布局
                    </button>
                    <button class="btn-icon" :class="tabindex == 2 ? 'active' : ''" @click="setTabId(2)">
                        <span class="iconfont  icon-yanse"></span>
                        颜色
                    </button>
                    <button class="icon-close" @click="closeDialog">
                        <span class="iconfont icon-guanbi"></span>
                    </button>
                </div>
            </div>
            <div class="dialog-container">
                <div class="setFont" v-show="tabindex == 0">
                    <div class="w-full">
                        <h2 class="htwo">字号</h2>
                        <div class="card">
                            <div class="card-item">
                                <div class="item-title">
                                    默认字号
                                </div>
                                <div class="item-content">
                                    <span> {{ currentStyle.fontSize }}</span>
                                    <button class="icon-btn" @click="sizejiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="icon-btn" @click="sizejiajian(true)">
                                        <span class="iconfont icon-jia"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <h2 class="htwo">字体粗细</h2>
                        <div class="card">
                            <div class="card-item">
                                <div class="item-title">
                                    默认粗细
                                </div>
                                <div class="item-content">
                                    <span> {{ currentStyle.fontWeight }}</span>
                                    <button class="icon-btn" @click="weightjiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="icon-btn" @click="weightjiajian(true)">
                                        <span class="iconfont icon-jia"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="setLayout" v-show="tabindex == 1">
                    <div class="w-full">
                        <div class="firstTitle">
                            <h2 class="htwo">排版模式</h2>
                            <div class="right-btn">
                                <button class="right-icon-btn" title="横排" @click="setWritingMode('horizontal-tb')">
                                    <span class="iconfont icon-wenzifangxiang-hengxiang" :class="currentStyle.writingMode == 'horizontal-tb' ? 'active' : ''">
                                    </span>
                                </button>
                                <button class="right-icon-btn" title="竖排" @click="setWritingMode('vertical-rl')">
                                    <span class="iconfont icon-wenzifangxiang-zongxiang" :class="currentStyle.writingMode == 'vertical-rl' ? 'active' : ''">
                                    </span>
                                </button>
                            </div>
                        </div>
                        <h2 class="htwo">段落</h2>
                        <div class="card">
                            <div class="card-item">
                                <div class="item-title">
                                    段间距
                                </div>
                                <div class="item-content">
                                    <span> {{ currentStyle.paragraphSpacing }}</span>
                                    <button class="icon-btn" @click="duanjiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="icon-btn" @click="duanjiajian(true)">
                                        <span class="iconfont icon-jia"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="card-item">
                                <div class="item-title">
                                    行间距
                                </div>
                                <div class="item-content">
                                    <span> {{ currentStyle.lineHeight }}</span>
                                    <button class="icon-btn" @click="linejiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="icon-btn" @click="linejiajian(true)">
                                        <span class="iconfont icon-jia"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="card-item">
                                <div class="item-title">
                                    词间距
                                </div>
                                <div class="item-content">
                                    <span> {{ currentStyle.wordSpacing }}</span>
                                    <button class="icon-btn" @click="wordjiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="icon-btn" @click="wordjiajian(true)">
                                        <span class="iconfont icon-jia"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="card-item">
                                <div class="item-title">
                                    字间距
                                </div>
                                <div class="item-content">
                                    <span> {{ currentStyle.letterSpacing }}</span>
                                    <button class="icon-btn" @click="letterjiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="icon-btn" @click="letterjiajian(true)">
                                        <span class="iconfont icon-jia"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="card-item">
                                <div class="item-title">
                                    首行缩进
                                </div>
                                <div class="item-content">
                                    <span> {{ currentStyle.textIndent }}</span>
                                    <button class="icon-btn" @click="tijiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="icon-btn" @click="tijiajian(true)">
                                        <span class="iconfont icon-jia"></span>
                                    </button>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="card-item">
                                <div class="item-title">
                                    两端对齐
                                </div>
                                <div class="item-content">
                                    <button :class="currentStyle.justify ? 'is-btn' : 'no-btn'" @click="setJustify">
                                        <span class="iconfont icon-heiyuandian">
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="card-item">
                                <div class="item-title">
                                    断字
                                </div>
                                <div class="item-content">
                                    <button :class="currentStyle.hyphenate ? 'is-btn' : 'no-btn'" @click="setHyphenate">
                                        <span class="iconfont icon-heiyuandian">
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="setColor" v-show="tabindex == 2">
                    <h2 class="htwo">主题颜色</h2>
                    <div class="colors">
                        <label v-for="(option, index) in colorOptions" :key="index" class="color-item"
                            :style="{ color: option.fontColor, backgroundColor: option.backgroundColor }" @click="setTheme(index)">
                            <span class="iconfont" :class="index === currentThemeIndex ? 'icon-selected-copy' : 'icon-danxuan_weixuanzhong'"></span>
                            <span>{{ option.label }}</span>
                        </label>
                    </div>

                </div>
            </div>
        </div>
    </dialog>
</template>

<style>
#dialog {
    width: 100%;
    height: 100%;
    z-index: 50;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.2);
    align-items: center;
    justify-content: center;
    display: flex;
}

.firstTitle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
}

.right-icon-btn {
    background-color: white;
}

.right-icon-btn .iconfont {
    border-radius: 50%;
    background-color: white;
    padding: 10px;
    font-size: 1.5rem;
}

.right-icon-btn .iconfont:hover {
    background-color: lightgray;
    cursor: pointer;
}

.right-icon-btn .active {
    background-color: lightgray;
    cursor: pointer;
}


.divider {
    height: 1px;
    background-color: #f0f0f0;
}

.setting-content {
    border-radius: 1rem;
    max-width: 600px;
    min-width: 520px;
    width: 50%;
    height: 80%;
    padding: 0;
    flex-direction: column;
    display: flex;
    z-index: 20;
    background-color: white;
}

.dialog-header {
    display: flex;
    align-items: center;
    z-index: 10;
    position: sticky;
    top: .25rem;
    padding-left: 1rem;
    padding-right: 1rem;
}

.btn-title {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    gap: .5rem;
    align-items: center;
    flex-grow: 1;
    max-width: 100%;
    height: 2.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
}

.btn-icon {
    height: 2rem;
    min-height: 2rem;
    padding-left: .75rem;
    padding-right: .75rem;
    font-size: .875rem;
    background-color: white;
    line-height: 1em;
    gap: .5rem;
    font-weight: 600;
}

.btn-icon:hover,
.active {
    background-color: lightgray;
    border-radius: 5px;
    border: 0;
    cursor: pointer;
}

.icon-close {
    background-color: white;
}

.icon-close .iconfont {
    border-radius: 50%;
    background-color: #f0f0f0;
    padding: 3px;
}

.icon-close .iconfont:hover {
    background-color: lightgray;
    cursor: pointer;
}

.dialog-container {
    padding-left: 10%;
    padding-right: 10%;
    overflow-y: auto;
    flex-grow: 1;
    margin-top: .5rem;
    margin-bottom: .5rem;
}

.setFont {
    width: 100%;
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.w-full {
    width: 100%;
}

.htwo {
    margin-bottom: .5rem;
    font-weight: 500;
}

.card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: .5rem;
    border: 2px solid #f0f0f0;
}

.card-item {
    display: flex;
    justify-content: space-between;
}

.item-title {
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    padding: 1rem;
}

.item-content {
    display: flex;
    gap: 1rem;
    padding: 1rem;
}

.item-content span {
    font-size: 16px;
}

.icon-btn {
    background-color: white;
}

.icon-btn .iconfont {
    border-radius: 50%;
    background-color: #f0f0f0;
    padding: 3px;
}

.icon-btn .iconfont:hover {
    background-color: lightgray;
    cursor: pointer;
}

.is-btn {
    background-color: white;
    width: 3rem;
    border: 1px solid #f0f0f0;
    justify-items: left;
    border-radius: 10px;
    display: flex;
    justify-content: flex-end;
    cursor: pointer;
}

.no-btn {
    background-color: white;
    width: 3rem;
    border: 1px solid #f0f0f0;
    border-radius: 10px;
    display: flex;
    justify-content: flex-start;
    cursor: pointer;
    color: gray;
}

.colors {
    display: flex;
    flex-wrap: wrap;
    /* 允许换行 */
    gap: 1rem;
}

.color-item {
    display: flex;
    cursor: pointer;
    padding: 1rem;
    border-radius: .5rem;
    justify-content: center;
    position: relative;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-size: 14px;
    background-color: #f0f0f0;
    flex: 1 0 calc(33.333% - 1rem);
    max-width: calc(33.333% - 1rem);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.colors .active {
    background-color: rgb(255, 255, 255);
    color: rgb(23, 23, 23);
    border: 1px solid rgb(23, 23, 23);

}

.hidden {
    display: none;
}
</style>
