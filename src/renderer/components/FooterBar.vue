<script setup>
import { ref } from 'vue';
import Tts from '../utils/readUtils/tts.js';
const isPlaying = ref(false);
const showLamp = ref(false);
const nextPage = (isNext) => {
    window.goToNext(isNext);
}
const speakText = () => {
    if (Tts.current_tts_state !== 1) {
        Tts.init(
            window.ttsHere,
            window.ttsNext,
            window.ttsPrev
        );
        Tts.speak();
        Tts.updateTtsState(Tts.PLAY_STATE.PLAYING);
        isPlaying.value = true;
        showLamp.value = true;
    }
}
const stopSpeaking = () => {
    Tts.stop();
    Tts.updateTtsState(Tts.PLAY_STATE.STOPPED);
    isPlaying.value = false;
}

const showTtspanel = () => {
    console.log("显示tss panel")
}
</script>
<template>
    <div class="tts-panel">
        <div class="panel-container">
            <div class="panel-top">
                <input class="range" min="0" max="3" step="0.1" type="range" value="1">
            </div>
        </div>
    </div>
    <div class="lamp" @click="showTtspanel" v-show="showLamp">
        <div class="lamp-container">
            <div class="lamp-content">
                <div class="lamp-real">
                    <div class="lamp-item" v-for="(item, index) in 4"
                        :style="isPlaying ?
                            'animation-name:bounce; animation-duration: 1.' + index + 's; animation-timing-function:ease-in-out;animation-iteration-count:infinite; animation-delay: 0.' + index + 's; '
                            : ''">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="footer-bar-container">
        <div class="footer-bar">
            <button title="上一页" class="footer-bar-button">
                <span class="iconfont icon-shangyiye" @click="nextPage(false)"></span>
            </button>
            <div id="current-percent"></div>
            <div id="nav-bar">
                <input id="progress-slider" type="range" min="0" max="1" step="any">
            </div>
            <button title="朗读" class="footer-bar-button">
                <span class="iconfont icon-erji" @click="speakText"></span>
            </button>
            <button title="下一页" class="footer-bar-button">
                <span class="iconfont icon-xiayiye" @click="nextPage(true)"></span>
            </button>
        </div>
    </div>
</template>
<style>
@keyframes moveGradient {
    0% {
        transform: translate(0, 0);
    }

    100% {
        transform: translate(25%, 25%);
    }
}

@keyframes bounce {

    0%,
    100% {
        transform: scaleY(1);
    }

    50% {
        transform: scaleY(0.6);
    }
}

.footer-bar-container {
    display: flex;
    position: absolute;
    justify-content: center;
    bottom: 0;
    width: 100%;
    height: 3rem;
}

.footer-bar {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    opacity: 0;
    transition-duration: .3s;
    margin: 0 auto;
    z-index: 10;
    vertical-align: top;
    width: 95%;
    height: 100%;
}

.footer-bar:hover {
    opacity: 1;
    background: white;
}

.footer-bar-button {
    width: 2rem;
    min-height: 2rem;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 0;
    background-color: transparent;
}

.footer-bar-button:hover {
    background-color: gainsboro;
    cursor: pointer;
    border-radius: 10px;
}

.footer-bar-button .iconfont {
    font-size: 20px;
}

#nav-bar {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
}

#current-percent {
    width: 2rem;
    margin-left: .5rem;
    margin-right: .5rem;
}

#progress-slider {
    flex: 1;
    margin-left: .5rem;
    margin-right: .5rem;
}

.lamp {
    width: 3rem;
    height: 3rem;
    right: 1.5rem;
    bottom: 3rem;
    position: fixed;
    z-index: 23;
}

.lamp:hover {
    cursor: pointer;
}

.lamp-container {
    width: 100%;
    position: relative;
    height: 100%;
}

.lamp-content {
    align-items: center;
    display: flex;
    inset: 0;
    position: absolute;
    justify-content: center;
    background-color: #10b981;
    border-radius: 50%;
}


.lamp-real {
    align-items: flex-end;
    display: flex;
    gap: 0.2rem;
}

.lamp-item {
    border-top-left-radius: .25rem;
    border-top-right-radius: .25rem;
    width: .25rem;
    height: 16px;
    background: #FFF;
}

.tts-panel {
    position: absolute;
    bottom: 6.5rem;
    right: 1rem;
    width: 324.3px;
    height: 184px;
    background-color: oklch(90.6701% 0 0 / 1);
    border-radius: 1rem;
    z-index: 25;
}

.panel-container {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    padding: 1rem;
}

.panel-top {
    flex-direction: column;
    width: 100%;
    display: flex;
}

.range {
    width: 100%;
    /* -webkit-appearance: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    border-radius: 1rem;
    background-color: transparent;
    height: 1.5rem;
    cursor: pointer;
    color: inherit; */
}
</style>