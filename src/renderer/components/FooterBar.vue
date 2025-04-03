<script setup>
import { ref, onMounted, watch } from 'vue';
import Tts from '../utils/readUtils/tts.js';
import EventBus from '../../common/EventBus';
import TtsData from '../utils/readUtils/ttsData.js';
const PLAY_STATE = ['SPEAKING', 'PAUSED', 'STOPPED'];
const playState = ref(PLAY_STATE[2]);
const currentVoiceIndex = ref(0);
const isShowLamp = ref(false);
const isShowPanel = ref(false);
const spendArr = ["慢", "", "1.0", "1.5", "2.0", "", "快"];
const currentData = ref(TtsData.getTtsData());
// 新增：控制声音选择菜单的显示与隐藏
const isShowVoiceMenu = ref(false);
// 新增 ref 用于获取按钮元素
const voiceButtonRef = ref(null);
const nextPage = (isNext) => {
    window.goToNext(isNext);
}
const speakText = () => {
    if (playState.value !== PLAY_STATE[0]) {
        Tts.init(
            window.ttsHere,
            window.ttsNext,
            window.ttsPrev
        );
        Tts.speak();
        playState.value = PLAY_STATE[0];
        isShowLamp.value = true;
    }
}

const playOrPause = () => {

    if (playState.value === PLAY_STATE[0]) {
        console.log('pause');
        Tts.pause();
        playState.value = PLAY_STATE[1];
        console.log(playState.value);
    } else if (playState.value === PLAY_STATE[1]) {
        console.log('resumeSpeak');
        Tts.resumeSpeak()
        playState.value = PLAY_STATE[0]
    } else {
        speakText();
    }
}

const showPanel = () => {
    isShowPanel.value = !isShowPanel.value;
}

const stopTts = () => {
    Tts.stop();
    playState.value = PLAY_STATE[2];
    isShowLamp.value = false;
    isShowPanel.value = false;
    // 新增：关闭声音选择菜单
    isShowVoiceMenu.value = false;
}

const handleTtsRateChange = () => {
    const ttsRate = currentData.value.ttsRate;
    const ttsDataObj = {
        ttsRate: ttsRate
    };
    Tts.setUtterance(ttsDataObj);
}

const showVoiceSelect = () => {
    // 新增：切换声音选择菜单的显示状态
    isShowVoiceMenu.value = !isShowVoiceMenu.value;

}

const selectVoice = (index) => {
    currentVoiceIndex.value = index;
    const ttsDataObj = {
        ttsVoiceIndex: index
    };
    Tts.setUtterance(ttsDataObj);
    // 新增：关闭声音选择菜单
    isShowVoiceMenu.value = false;
}
onMounted(() => {
    // 监听菜单显示状态的变化
    watch(isShowVoiceMenu, (newValue) => {
        if (newValue) {
            const buttonRect = voiceButtonRef.value.getBoundingClientRect();
            const voiceMenu = document.querySelector('.voice-menu');
            if (voiceMenu) {
                voiceMenu.style.left = `${buttonRect.left}px`;
                voiceMenu.style.bottom = `${window.innerHeight - buttonRect.top}px`;
            }
        }
    });
});
//非自动翻页时，停止朗读
EventBus.on('pagesTts', () => {
    if (playState.value === PLAY_STATE[0]) {
        Tts.stop();
        speakText();
    }
})

</script>
<template>
    <div class="tts-panel" v-if="isShowPanel">
        <div class="panel-container">
            <div class="panel-top">
                <input v-model="currentData.ttsRate" class="range" min="0" max="3" step="0.1" type="range" @input="handleTtsRateChange">
                <div class="line">
                    <span class="text-center" v-for="(item, index) in 7">|</span>
                </div>
                <div class="line">
                    <span class="text-center" v-for="(item, index) in spendArr">{{ item }}</span>
                </div>
                <div class="panel-btns">
                    <button class="panel-btn">
                        <span class="iconfont icon-a-26Ashangyige" @click="Tts.speakPrev" title="上一句"></span>
                    </button>
                    <button class="panel-btn play-active" @click="playOrPause" :title="playState === PLAY_STATE[0] ? '暂停' : '播放'">
                        <span class="iconfont " :class="playState === PLAY_STATE[0] ? 'icon-weibiaoti519' : 'icon-bofang1'"></span>
                    </button>
                    <button class="panel-btn">
                        <span class="iconfont icon-a-26Bxiayige" @click="Tts.speakNext" title="下一句"></span>
                    </button>
                    <button class="panel-btn" @click="stopTts">
                        <span class="iconfont icon-tingzhi" title="停止朗读"></span>
                    </button>
                    <button class="panel-btn">
                        <span class="iconfont icon-shengyin" title="选择声音" @click="showVoiceSelect"></span>
                    </button>
                </div>
                <!-- 新增：声音选择菜单 -->
                <div class="voice-menu" v-if="isShowVoiceMenu">
                    <ul>
                        <li v-for="(voice, index) in Tts.getVoices()" :key="index" @click="selectVoice(index)" :class="currentVoiceIndex === index ? 'active' : ''">
                            <span class="single-line">{{ voice.name }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lamp" @click="showPanel" v-show="isShowLamp">
        <div class="lamp-container">
            <div class="lamp-content">
                <div class="lamp-real">
                    <div class="lamp-item" v-for="(item, index) in 4"
                        :style="Tts.synth.speaking ?
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
                <input id="progress-slider" class="range" type="range" min="0" max="1" step="any">
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
    bottom: 1rem;
    width: 100%;
    height: 3rem;
    z-index: 30;
}

.footer-bar {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition-duration: .3s;
    margin: 0 auto;
    vertical-align: top;
    width: 90%;
    height: 100%;
    opacity: 0;
    background-color: var(--bg);
}

.footer-bar:hover {
    opacity: 1;
}

.footer-bar-button {
    margin-right: 1rem;
    width: 2rem;
    min-height: 2rem;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 0;
    background-color: var(--bg);
    color: var(--fc);
}

.footer-bar-button:hover {
    cursor: pointer;
    border-radius: 10px;
    background-color: var(--bbc);
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
    color: var(--fc);
    font-size: 1rem;
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
    z-index: 40;
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
    background-color: var(--bbc);
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
    background: var(--fc);
}

.tts-panel {
    position: absolute;
    bottom: 6.5rem;
    right: 1rem;
    width: 324.3px;
    height: 184px;
    background-color: var(--bg);
    border-radius: 10px;
    z-index: 25;
    opacity: 1;
    border-color: var(--bbc);
    box-shadow: 0 4px 8px var(--bbc);
    color: var(--fc) !important;
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
    align-items: center;
    justify-content: center;
    gap: .5rem;
}

.line {
    font-size: .75rem;
    line-height: 1rem;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    width: 100%;
    display: grid;
}

.text-center {
    text-align: center;
}

.panel-btns {
    display: flex;
    flex-direction: row;
    width: 90%;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
}

.panel-btn {
    width: 40px;
    height: 40px;
    background-color: transparent;
    color: var(--fc);
}

.panel-btn:hover {
    cursor: pointer;
}

.play-active,
.play-active:hover {
    background-color: var(--bbc);
    cursor: pointer;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    display: flex;
}

.play-active .iconfont {
    font-size: 20px;
}

.panel-btn .iconfont {
    font-size: 24px;
}

/* 声音选择菜单的样式 */
.voice-menu {
    position: fixed;
    background-color: var(--bg);
    padding: 8px;
    z-index: 100;
    width: 150px;
    color: var(--fc);
}

.voice-menu ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

.voice-menu li {
    padding: 8px;
    cursor: pointer;
    border-radius: 4px;
    box-shadow: 0 2px 4px var(--bbc);

}

.voice-menu li:hover {
    background-color: var(--bbc);
}

.voice-menu li.active {
    background-color: var(--bbc);
}

.single-line {
    white-space: nowrap;
    /* 禁止文本换行 */
    overflow: hidden;
    /* 隐藏溢出的内容 */
    text-overflow: ellipsis;
    /* 溢出部分用省略号表示 */
    display: block;
}
</style>