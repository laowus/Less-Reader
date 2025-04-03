<script setup>
import { ref, onMounted } from 'vue';
import EventBus from '../../common/EventBus';
import StyleUtil from '../utils/readUtils/styleUtil'
import Theme from '../utils/readUtils/theme';
const tabindex = ref(0);
const isAddTheme = ref(false);
const colorOptions = ref(Theme.getThemes());
const currentThemeIndex = ref(StyleUtil.getThemeIndex());
const currentFonts = ref([]);
const showColorPicker = ref(false);
EventBus.on('showDialog', (showhide) => {
    dialogRef.value.showModal();
})
const closeDialog = () => {
    EventBus.emit('read-dialog-show', false);
}
const currentStyle = ref(StyleUtil.getStyle())
const addTheme = ref({ label: "自定义", backgroundColor: "#FFFFFF", fontColor: "#000000", btnBgColor: '#0066cc' })

const sizejiajian = (isJia) => {
    if (currentStyle.value.fontSize <= 10 && !isJia || currentStyle.value.fontSize >= 25 && isJia) {
        return;
    }
    isJia ? currentStyle.value.fontSize++ : currentStyle.value.fontSize--;
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
}
const weightjiajian = (isJia) => {
    console.log(currentStyle.value.fontWeight);
    if (currentStyle.value.fontWeight <= 100 && !isJia || currentStyle.value.fontWeight >= 800 && isJia) {
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
    const currentTheme = Theme.getThemes()[index];
    currentStyle.value.fontColor = currentTheme.fontColor;
    currentStyle.value.backgroundColor = currentTheme.backgroundColor;
    currentStyle.value.btnBgColor = currentTheme.btnBgColor;
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
    EventBus.emit('updateLeftbarStyle');
    EventBus.emit('set-theme');
}

onMounted(async () => {
    initBtnBgColor();
    const fontlist = await window.queryLocalFonts();
    if (fontlist) {
        const nonChineseFonts = fontlist.filter(font => !/[\u4e00-\u9fa5]/.test(font.fullName));
        // 筛选出中文字体
        const chineseFonts = fontlist.filter(font => /[\u4e00-\u9fa5]/.test(font.fullName));
        // 拼接非中文字体和中文字体，中文字体排在最后
        currentFonts.value = nonChineseFonts.concat(chineseFonts);
        console.log(fontlist);
    }
});

const initBtnBgColor = () => {
    currentStyle.value.btnBgColor = StyleUtil.getChangeColor(currentStyle.value.backgroundColor, "dark", 20);
}

const handleFontChange = (event) => {
    const selectedFontFamily = event.target.value;
    currentStyle.value.fontFamily = selectedFontFamily;
    StyleUtil.setStyle(currentStyle.value);
    window.setStyle(currentStyle.value);
};

const saveTheme = () => {
    const res = Theme.addTheme(addTheme.value);
    if (res) {
        colorOptions.value = Theme.getThemes();
        isAddTheme.value = false;
    } else {
        alert("主题名称重复");
    }
}
const deleteTheme = (label) => {
    Theme.deleteTheme(label);
    colorOptions.value = Theme.getThemes();
}

const setBtnBgColor = (event) => {
    const str = event.target.value;
    console.log('setBtnBgColor', str);
    const [type, value] = str.split("-");
    addTheme.value.btnBgColor = StyleUtil.getChangeColor(addTheme.value.backgroundColor, type, value);
}

</script>
<template>
    <dialog id="dialog" class="modal">
        <div class="setting-content">
            <div class="dialog-header">
                <div class="btn-title">
                    <button class="btn-text-icon" :class="tabindex == 0 ? 'active' : ''" @click="setTabId(0)">
                        <span class="iconfont  icon-zitidaxiao"></span>
                        字体
                    </button>
                    <button class="btn-text-icon" :class="tabindex == 1 ? 'active' : ''" @click="setTabId(1)">
                        <span class="iconfont  icon-layoutForm"></span>
                        布局
                    </button>
                    <button class="btn-text-icon" :class="tabindex == 2 ? 'active' : ''" @click="setTabId(2)">
                        <span class="iconfont  icon-yanse"></span>
                        颜色
                    </button>
                    <button class="btn-icon" @click="closeDialog">
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
                                    <button class="btn-icon" @click="sizejiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="btn-icon" @click="sizejiajian(true)">
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
                                    <button class="btn-icon" @click="weightjiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="btn-icon" @click="weightjiajian(true)">
                                        <span class="iconfont icon-jia"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <h2 class="htwo">字体</h2>
                        <div class="card">
                            <div class="card-item">
                                <div class="item-title">
                                    当前字体
                                </div>
                                <div class="item-content">
                                    <select @change="handleFontChange" :style="{ 'font-family': currentStyle.fontFamily, 'font-weight': currentStyle.fontWeight, 'font-size': currentStyle.fontSize }"
                                        class="select-option">
                                        <option v-for="font in currentFonts" :key="font.family"
                                            :selected="font.family === currentStyle.fontFamily" :value="font.family" :style="{ 'font-family': font.family }" class="sel-option">
                                            {{ font.fullName }}
                                        </option>
                                    </select>
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
                                <button class="btn-icon big-btn" :class="currentStyle.writingMode == 'horizontal-tb' ? 'active' : ''" title="横排" @click="setWritingMode('horizontal-tb')">
                                    <span class="iconfont icon-wenzifangxiang-hengxiang">
                                    </span>
                                </button>
                                <button class="btn-icon big-btn" :class="currentStyle.writingMode == 'vertical-rl' ? 'active' : ''" title="竖排" @click="setWritingMode('vertical-rl')">
                                    <span class="iconfont icon-wenzifangxiang-zongxiang">
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
                                    <button class="btn-icon" @click="duanjiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="btn-icon" @click="duanjiajian(true)">
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
                                    <button class="btn-icon" @click="linejiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="btn-icon" @click="linejiajian(true)">
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
                                    <button class="btn-icon" @click="wordjiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="btn-icon" @click="wordjiajian(true)">
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
                                    <button class="btn-icon" @click="letterjiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="btn-icon" @click="letterjiajian(true)">
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
                                    <button class="btn-icon" @click="tijiajian(false)">
                                        <span class="iconfont icon-jian"></span>
                                    </button>
                                    <button class="btn-icon" @click="tijiajian(true)">
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
                <div class="setColor" v-show="tabindex == 2 && isAddTheme == false">
                    <h2 class="htwo">主题颜色</h2>
                    <div class="colors">
                        <label v-for="(option, index) in colorOptions" :key="index" class="color-item"
                            :style="{ color: option.fontColor, backgroundColor: option.backgroundColor }" @click="setTheme(index)">
                            <span class="iconfont" :class="index === currentThemeIndex ? 'icon-selected-copy' : 'icon-danxuan_weixuanzhong'"></span>
                            <span>{{ option.label }}</span>
                            <span class="iconfont icon-guanbi" :class="[index > 0 ? 'btn-delete' : 'hidden']" :style="{ color: option.backgroundColor, backgroundColor: option.fontColor }"
                                @click="deleteTheme(option.label)">
                            </span>
                        </label>
                        <label class="color-item" @click="isAddTheme = true">
                            <span class="iconfont icon-jia add"></span>
                            <span>自定义</span>
                        </label>
                    </div>
                </div>
                <div class="setColor" v-show="tabindex == 2 && isAddTheme == true">
                    <div class="firstTitle">
                        <h2 class="htwo">自定义主题</h2>
                        <div class="right-btn">
                            <button class="btn-text-icon" @click="saveTheme">
                                <span class="iconfont icon-queren1"></span>
                                保存
                            </button>
                            <button class="btn-text-icon" @click="isAddTheme = false">
                                <span class="iconfont icon-quxiao"></span>
                                取消
                            </button>
                        </div>
                    </div>
                    <div class="firstTitle">
                        <h2 class="htwo">主题名称</h2>
                        <div class="right-btn1">
                            <input class="themeName" v-model="addTheme.label">
                        </div>
                    </div>
                    <div class="themeContent">
                        <div class="themeCard">
                            <div>
                                文本颜色
                            </div>
                            <div class="color-select-panel">
                                <input class="select-panel"
                                    type="color"
                                    v-model="addTheme.fontColor">
                                <div class="color-data">
                                    <input v-model="addTheme.fontColor" disabled>
                                </div>
                            </div>
                            <div>
                                背景颜色
                            </div>
                            <div class="color-select-panel">
                                <input class="select-panel"
                                    type="color"
                                    v-model="addTheme.backgroundColor">
                                <div class="color-data">
                                    <input v-model="addTheme.backgroundColor" disabled>
                                </div>
                            </div>
                            <div>
                                过度颜色
                            </div>
                            <div class="color-select-panel">
                                <select @change="setBtnBgColor">
                                    <option value="dark-10">暗10%</option>
                                    <option value="dark-20">暗20%</option>
                                    <option value="light-10">亮10%</option>
                                    <option value="light-20">亮20%</option>
                                </select>
                                <input class="select-panel"
                                    type="color"
                                    v-model="addTheme.btnBgColor">
                                <div class="color-data">
                                    <input v-model="addTheme.btnBgColor" disabled>
                                </div>
                            </div>
                        </div>
                        <div class="themeCard">
                            <div class="example-text">
                                预览
                            </div>
                            <div class="result" :style="{ 'backgroundColor': addTheme.backgroundColor, 'color': addTheme.fontColor }">
                                Less-Reader是一款基于 Electron + Vue 3 开发的电子书阅读器。 支持格式: epub , mobi, azw3。
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </dialog>
</template>

<style>
.select-option {
    width: 15rem;
    text-wrap: wrap;
}

.sel-option {
    width: 10rem;
    white-space: normal;
    /* 允许文本换行 */
    word-wrap: break-word;
    /* 允许长单词换行 */
    overflow-wrap: break-word;
    /* 同上，用于更广泛的浏览器兼容性 */
}

.themeName {
    width: 80%;
    height: 2rem;
    border-radius: 10px;
    border-color: #000;
    font-size: 16px;
}

.themeContent {
    padding-top: 1rem;
    display: flex;
    flex-direction: row;
    gap: 2rem;
    width: 100%;
    flex: 1;
}

.themeCard {
    background-color: var(--bg);
    border-radius: 10px;
    border-color: transparent;
    width: 80%;
    height: 200px;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
}

.color-select-panel {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.select-panel {
    width: 3rem;
    height: 2rem;
    border-radius: 5px;
    cursor: pointer;
    padding: 0;
    border-color: transparent;
}



.color-data input {
    width: 80%;
    height: 2rem;
    border-radius: 5px;
    font-size: 16px;
    letter-spacing: 1px;
}

.result {
    border-radius: 5px;
    flex: 1;
    background-color: white;
    text-indent: 2rem;
    padding: 0.5rem;
}

#dialog {
    width: 100%;
    height: 100%;
    z-index: 50;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.5);
    align-items: center;
    justify-content: center;
    display: flex;
    color: var(--fc);
}

.firstTitle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
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
    background-color: var(--bg);
    padding-top: 1rem;
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
    margin-bottom: 1rem;
}

.right-btn {
    display: flex;
    gap: 2rem;
    flex-direction: row;
    justify-content: space-between;
}

.right-btn1 {
    display: flex;
    gap: 2rem;
    flex-direction: row;
    justify-content: flex-end;
}


.big-btn {
    width: 2.5rem !important;
    height: 2.5rem !important;
    background-color: var(--bg) !important;
    border-radius: 50%;
}

.right-btn .active {
    background-color: var(--bbc) !important;
    border-radius: 50%;
}


.dialog-container {
    margin-left: 2rem;
    margin-right: 2rem;
    margin-top: .5rem;
    margin-bottom: .5rem;
    overflow-y: auto;
    flex-grow: 1;
    padding-right: 1rem;

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
    border: 1px solid #f0f0f0;
}

.card-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* 新增：垂直居中对齐 */
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
    align-items: center;
}

.item-content span {
    font-size: 14px;
    padding: 0.5rem;
}

.item-content select {
    background-color: var(--bbc);
    border-radius: 10px;
    height: 2rem;
    text-align: right;
    color: var(--fc);
}

.is-btn {
    background-color: white;
    width: 4rem;
    height: 2rem !important;
    border: 1px solid #f0f0f0;
    background-color: var(--bbc);
    justify-items: left;
    border-radius: 10px;
    display: flex;
    justify-content: flex-end;
    cursor: pointer;
}

.no-btn {
    background-color: white;
    width: 4rem;
    height: 2rem !important;
    border: 1px solid #f0f0f0;
    border-radius: 10px;
    display: flex;
    justify-content: flex-start;
    cursor: pointer;
    color: gray;
    background-color: var(--bbc);
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

.color-item .add {
    font-size: 20px;
    color: #000;
    font-weight: bold;
}

.hidden {
    display: none;
}

.btn-delete {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    border: none;
    cursor: pointer;
    visibility: hidden;
    font-size: 1rem !important;
    background-color: transparent;
    border-radius: 50%;

}


.color-item:hover .btn-delete {
    visibility: visible;
}
</style>
