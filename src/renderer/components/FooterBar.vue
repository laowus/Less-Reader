<script setup>
import { onMounted } from 'vue';
import Speak from 'speak-tts';
const speak = new Speak();

const nextPage = (isNext) => {
    window.goToNext(isNext);
}
onMounted(async () => {
    try {
        await speak.init({
            volume: 1,
            lang: 'zh-CN',
            rate: 1,
            pitch: 1,
            splitSentences: true,
            listeners: {
                onstart: () => {
                    console.log('开始朗读');
                },
                onend: () => {
                    console.log('朗读结束');
                },
                onerror: (error) => {
                    console.error('朗读出错:', error);
                },
            },
        });

        // 借助浏览器原生 Web Speech API 获取可用语音
        const getVoices = () => {
            return new Promise((resolve) => {
                const synth = window.speechSynthesis;
                let voices = synth.getVoices();
                if (voices.length > 0) {
                    resolve(voices);
                } else {
                    synth.onvoiceschanged = () => {
                        voices = synth.getVoices();
                        resolve(voices);
                    };
                }
            });
        };

        const voices = await getVoices();
        console.log('可用语音:', voices);
        // 示例：选择第一个中文语音
        const chineseVoices = voices.filter(voice => voice.lang === 'zh-CN');
        console.log('可用语音:', chineseVoices);
        if (chineseVoices.length > 0) {
            const selectedVoice = chineseVoices[2];
            // 设置选中的语音
            speak.setVoice(selectedVoice.name);
        }
    } catch (error) {
        console.error('初始化失败:', error);
    }
});
const speakText = () => {
    const text = '3月19日，因韵达快递部分加盟企业对协议客户安全管理存在重大漏洞，造成受害人重大财产损失。国家邮政局依法将进行立案调查。';
    speak.speak({
        text: text,
    });
};



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