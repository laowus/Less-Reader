<script setup>
const props = defineProps({
    posStyle: Object,
    data: Array
})
</script>
<template>
    <div class="common-ctx-menu" :style="posStyle" @click.stop="">
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
</style>