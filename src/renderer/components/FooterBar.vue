<script setup>
import Tts from '../utils/readUtils/tts.js'

const nextPage = (isNext) => {
    window.goToNext(isNext);
}
const testText = `再过一会，忽听外面树丛中似乎有人坐了下来，崔秋山右手拿起钢叉，左手放在袁承志嘴边，只怕他梦中发出什么声响，凝神静听。只听见一人喝道：“那姓袁的逆贼留下一个儿子，他到那里去了？”这句话声音很响，登时把袁承志吵醒，崔秋山拉着他，叫他别动。又听见那人喝道：“你说不说？不说我先砍断你的一条腿。”一个声音骂道：“你砍就砍，我们在边庭上一刀一枪打鞑子，岂怕你这种奸贼！”听口音正是应松的声音，袁承志轻轻叫了一声：“应叔叔！”那人又骂：“你真的不说？”应松呸的一声，似乎一口唾沫吐向他的脸上，接着一声惨叫，大概已被他一刀砍伤，袁承志再也忍耐不住，身子一挣，挣脱了崔秋山拉住他的手，大叫一声：“应叔"`;

const speakText = () => {
    Tts.init();
    Tts.speak(testText);
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