<script setup>
import Tts from '../utils/readUtils/tts.js';
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
    }
}

</script>
<template>
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
</style>