<script setup>
const { ipcRenderer } = window.require('electron');

const handleMinimize = () => {
    ipcRenderer.send('window-min')
}

const handleClose = () => {
    ipcRenderer.send('window-close');
}
</script>

<template>
    <div class="title-bar">
        <div class="title-bar-dragger"></div>
        <ul class="window-actions">
            <li @click="handleMinimize">
                <el-icon>
                    <Minus />
                </el-icon>
            </li>
            <li class="win-close-btn" @click="handleClose">
                <el-icon>
                    <Close />
                </el-icon>
            </li>
        </ul>
    </div>
</template>

<style>
.title-bar {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 40px;
    z-index: 10;
    background-color: #fefefe;
}

.window-actions {
    opacity: 0.4;
    list-style: none;
    padding: 0;
    margin: 0;
    z-index: 5100;
    display: flex;
}

.window-actions>li {
    font-size: 16px;
    margin: 0;
    color: #1f1f1f;
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    /* 垂直居中 */
    justify-content: center;
}


.window-actions>li:hover {
    background-color: #eee;
}

.window-actions:hover {
    opacity: 1;
    cursor: pointer;
}

.win-close-btn:hover {
    color: #fff;
    background-color: #fd0007;
    cursor: pointer;
}

.title-bar-dragger {
    margin: 5px 0 0 5px;
    flex: 1;
    user-select: none;
    -webkit-app-region: drag;
    -webkit-user-select: none;
}
</style>
