<script setup>
const props = defineProps({
    posStyle: Object
})

</script>

<template>
    <div class="common-ctx-menu" :style="posStyle" @click.stop="">
        <div class="padding"></div>
        <div class="center">
            <div class="menuItem">
                <div v-html="item.icon"></div>
                <div><span>{{ item.name }}</span></div>
            </div>
        </div>
        <div class="padding"></div>
    </div>
</template>

<style>
.common-ctx-menu {
    position: absolute;
    z-index: 101;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--ctx-menu-bg);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    box-shadow: 0px 0px 8px var(--ctx-menu-border-color);
    max-height: 386px;
}

.common-ctx-menu .padding {
    height: 15px;
}

.common-ctx-menu .center {
    overflow: auto;
}

.common-ctx-menu .menuItem {
    width: 139px;
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 14px;
    padding: 9px 20px;
}

.common-ctx-menu .menuItem:hover {
    background-color: var(--text-sub-color);
    background: var(--btn-bg);
    color: var(--svg-btn-color);
}

.common-ctx-menu .menuItem:hover svg {
    fill: var(--svg-btn-color);
}

.common-ctx-menu .menuItem>div {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.common-ctx-menu .menuItem svg {
    margin-right: 15px;
    fill: var(--text-color);
}

.common-ctx-menu .menuItem span {
    overflow: hidden;
    word-wrap: break-all;
    white-space: pre-wrap;
    line-break: anywhere;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    text-align: left;
}

.common-ctx-menu .separator {
    margin: 3px 15px;
    height: 0px;
    border-bottom: 0.36px solid var(--border-color);
}
</style>