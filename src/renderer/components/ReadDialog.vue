<script setup>
import { ref } from 'vue';
import EventBus from '../../common/EventBus';
const tabindex = ref(0)

EventBus.on('showDialog', (showhide) => {
    dialogRef.value.showModal();
})

const closeDialog = () => {
    EventBus.emit('read-dialog-show', false);
}

</script>

<template>
    <dialog id="dialog" class="modal">
        <div class="setting-content">
            <div class="dialog-header">
                <div class="btn-title">
                    <button class="btn-icon" :class="tabindex == 0 ? 'active' : ''">
                        <span class="iconfont  icon-zitidaxiao"></span>
                        字体
                    </button>
                    <button class="btn-icon" :class="tabindex == 1 ? 'active' : ''">
                        <span class="iconfont  icon-layoutForm"></span>
                        布局
                    </button>
                    <button class="btn-icon" :class="tabindex == 2 ? 'active' : ''">
                        <span class="iconfont  icon-yanse"></span>
                        颜色
                    </button>
                    <button class="icon-close" @click="closeDialog">
                        <span class="iconfont icon-guanbi"></span>
                    </button>
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

.setting-content {
    border-radius: 1rem;
    max-width: 600px;
    min-width: 520px;
    width: 50%;
    height: 65%;
    padding: 0;
    flex-direction: column;
    display: flex;
    z-index: 20;
    background-color: white;
}

.dilog-header {
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
</style>
