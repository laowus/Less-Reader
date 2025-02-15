<script setup>
import { ref, onMounted } from 'vue'
const activeName = ref('first')

const props = defineProps({
    bookStyle: Object
})

const handleClick = (tab, event) => {

}
onMounted(() => {
    console.log(props.bookStyle);
})


</script>
<template>
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" tab-position="bottom" type="border-card" stretch>
        <el-tab-pane name="first">
            <template #label>
                <span class="tab-item-title">
                    <el-icon :size="20">
                        <List />
                    </el-icon>
                    <span> 目录</span>
                </span>
            </template>
            <div id="side-bar-header">
                <img id="side-bar-cover">
                <div>
                    <h1 id="side-bar-title"></h1>
                    <p id="side-bar-author"></p>
                </div>
            </div>
            <div id="toc-view"></div>
        </el-tab-pane>
        <el-tab-pane name="second">
            <template #label>
                <span class="tab-item-title">
                    <el-icon :size="20">
                        <LocationFilled />
                    </el-icon>
                    <span>进度</span>
                </span>
            </template>
            <div id="nav-bar">
                <!-- 进度条 -->
                <input id="progress-slider" type="range" min="0" max="1" step="any" list="tick-marks">
                <datalist id="tick-marks"></datalist>
            </div>
        </el-tab-pane>
        <el-tab-pane name="three">
            <template #label>
                <span class="tab-item-title">
                    <el-icon :size="20">
                        <Notebook />
                    </el-icon>
                    <span> 笔记</span>
                </span>
            </template>
            <div>笔记</div>
        </el-tab-pane>
        <el-tab-pane name="four">
            <template #label>
                <span class="tab-item-title">
                    <el-icon :size="20">
                        <Reading />
                    </el-icon>
                    <span>文字</span>
                </span>
            </template>
            <div id="styles">
                <span style="font-size: 20px;font-weight: bolder;"> 样式</span>
                <el-divider />
                <div class="slider-demo-block">
                    <span class="infoTip">字体<br />大小</span>
                    <el-slider v-model="bookStyle.fontsize" :min="0.5" :max="2.0" :step="0.1" show-stops />
                </div>
                <div class="slider-demo-block">
                    <span class="infoTip2">行距</span>
                    <el-slider v-model="bookStyle.lineHeight" :min="1" :max="10" :step="1" show-stops />
                    <span class="infoTip2">段距</span>
                    <el-slider v-model="bookStyle.paragraphSpacing" :min="1" :max="10" :step="1" show-stops />
                </div>
            </div>

        </el-tab-pane>

    </el-tabs>
</template>
<style>
.demo-tabs {
    width: 100%;
    border: 5px solid transparent;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

.el-tab-pane {
    height: 100%;
    overflow-y: auto;
}

.tab-item-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    height: 100%;
}

.demo-tabs>.el-tabs__content {
    color: #6b778c;
}

#toc-view {
    padding: .5rem;
    overflow-y: scroll;
}

#toc-view li,
#toc-view ol {
    margin: 0;
    padding: 0;
    list-style: none;
}

#toc-view a,
#toc-view span {
    display: block;
    border-radius: 6px;
    padding: 8px;
    margin: 2px 0;
}

#toc-view a {
    color: CanvasText;
    text-decoration: none;
}

#toc-view a:hover {
    background: var(--active-bg);
}

#toc-view span {
    color: GrayText;
}

#toc-view svg {
    margin-inline-start: -24px;
    padding-inline-start: 5px;
    padding-inline-end: 6px;
    fill: CanvasText;
    cursor: default;
    transition: transform .2s ease;
    opacity: .5;
}

#toc-view svg:hover {
    opacity: 1;
}

#toc-view [aria-current] {
    font-weight: bold;
    background: var(--active-bg);
}

#toc-view [aria-expanded="false"] svg {
    transform: rotate(-90deg);
}

#toc-view [aria-expanded="false"]+[role="group"] {
    display: none;
}

#side-bar-cover {
    height: 10vh;
    min-height: 60px;
    max-height: 180px;
    border-radius: 3px;
    border: 0;
    background: lightgray;
    box-shadow: 0 0 1px rgba(0, 0, 0, .1), 0 0 16px rgba(0, 0, 0, .1);
    margin-inline-end: 1rem;
}

#side-bar-cover:not([src]) {
    display: none;
}

#side-bar-title {
    margin: .5rem 0;
    font-size: inherit;
}

#side-bar-author {
    margin: .5rem 0;
    font-size: small;
    color: GrayText;
}

.menu-container {
    position: relative;
}

.menu,
.menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.menu {
    visibility: hidden;
    position: absolute;
    right: 0;
    background: Canvas;
    color: CanvasText;
    border-radius: 6px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .2), 0 0 16px rgba(0, 0, 0, .1);
    padding: 6px;
    cursor: default;
}

.menu.show {
    visibility: visible;
}

.menu li {
    padding: 6px 12px;
    padding-left: 24px;
    border-radius: 6px;
}

.menu li:hover {
    background: var(--active-bg);
}

.menu li[aria-checked="true"] {
    background-position: center left;
    background-repeat: no-repeat;
    background-image: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%223%22%2F%3E%3C%2Fsvg%3E');
}

#nav-bar {
    height: 100%;
    width: 100%;
    display: flex;
}

#progress-slider {
    margin: 0 12px;
    flex: 1;

}

#styles {
    height: 300px;
    width: 100%;
    text-align: left;
}

.slider-demo-block {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.slider-demo-block .el-slider {
    margin-top: 0;
    margin-left: 12px;
    flex: 1
}

.infoTip {
    margin-left: 5px;
    font-size: 10px;
    height: 40px;
    width: 40px;
    display: inline-block;
    border: 1px solid #000000;
    border-radius: 50%;
    text-align: center;
    box-sizing: border-box;
}

.infoTip2 {
    margin-left: 5px;
    font-size: 12px;
    height: 40px;
    width: 40px;
    display: flex;
    border: 1px solid #000000;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    font-weight: bolder;
}
</style>