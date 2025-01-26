<script setup>
import { ref } from 'vue'
const activeName = ref('first')
const handleClick = (tab, event) => {

}
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
            <div id="toc-view"></div>
        </el-tab-pane>
        <el-tab-pane name="second">
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
        <el-tab-pane name="three">
            <template #label>
                <span class="tab-item-title">
                    <el-icon :size="20">
                        <Reading />
                    </el-icon>
                    <span>文字</span>
                </span>
            </template>
            <div>文字</div>
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
</style>