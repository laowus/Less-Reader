export const PLAY_STATE = {
    PLAYING: 1, STOPPED: 2, PAUSED: 3, CONTINUED: 4
}

export default class Tts {

    static synth = window.speechSynthesis;
    static voices = [];
    static isSpeaking = false;
    static isInit = false;

    static getHere = () => "";
    static getNextVoiceText = () => '';
    static getPrevVoiceText = () => '';

    // 初始化语音合成功能
    static init(here, next, prev) {
        if (this.isInit) return;
        this.getHere = here;
        this.isInit = true;
        getNextVoiceText = next;
        getPrevVoiceText = prev;

    }

    static speak(text) {
        if (!this.isInit) {
            console.error('Tts is not initialized. Call Tts.init() first.');
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);

        // 监听语音合成开始事件
        utterance.onstart = () => {
            this.isSpeaking = true;
            console.log('TTS started speaking.');
        };

        // 监听语音合成结束事件
        utterance.onend = () => {
            this.isSpeaking = false;
            console.log('TTS finished speaking.');
        };

        this.synth.speak(utterance);
    }
}