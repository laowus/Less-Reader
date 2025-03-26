<script setup>
import TitleBar from '../components/TitleBar.vue';
</script>
<template>
    <el-container>
        <el-aside class="left">
            <el-menu
                :default-active="$route.fullPath" router :collapse="true" class="leftmenu">
                <el-menu-item index="/">
                    <el-icon>
                        <Notebook />
                    </el-icon>
                    <template #title>书架</template>
                </el-menu-item>
                <el-menu-item index="/note">
                    <el-icon>
                        <Shop />
                    </el-icon>
                    <template #title>笔记</template>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <TitleBar></TitleBar>
        <el-container>
            <el-main class="main">
                <router-view>
                </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<style>
:root {
    --left-width: 50px !important;
    --left-bg: #505a85;
    --top-height: 90px;
    --el-menu-base-level-padding: 4px !important;
    --el-menu-level-padding: 4px !important;
}

::-webkit-scrollbar {
    width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
    -webkit-border-radius: 5px;
    border-radius: 5px;
}

/* Handle */
::-webkit-scrollbar-thumb {
    opacity: 0.1;
    -webkit-border-radius: 10px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.5);
}

.left {
    background-color: var(--left-bg);
    width: var(--left-width) !important;
    height: calc(100vh);
    z-index: 11;
}

.leftmenu {
    margin-left: 10px !important;
    margin-top: 20px !important;
    background-color: var(--left-bg) !important;
}

.logo:hover {
    transform: scale(1.2);
    transition: all 0.3s;
    cursor: pointer;
}

.main {
    background-color: #fefefe;
    color: #333;
    height: calc(100% - 90px);
    width: calc(100% - 60px);
}

.el-menu {
    border: 0px !important;
    overflow-x: hidden;
}

.el-menu-item {
    border-radius: 30px;
    margin: 30px 2px;
    color: #e3e3e3 !important;
    width: 30px !important;
    height: 30px !important;
}

.el-menu-item:focus,
.el-menu-item:hover,
.el-submenu__title:focus,
.el-submenu__title:hover {
    background-color: #008aff !important;
}

.el-menu-item.is-active {
    transition: all 1s;
    border-radius: 20px;
    background-color: #008aff !important;
    color: white !important;
}
</style>
