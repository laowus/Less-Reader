export default class Tts {

    static PLAY_STATE = {
        PLAYING: 1, STOPPED: 2, PAUSED: 3, CONTINUED: 4
    }
    static synth = window.speechSynthesis;
    static voices = [];
    static current_tts_state = this.PLAY_STATE.STOPPED;
    static isInit = false;

    static getHere = () => "";
    static getNextVoiceText = () => '';
    static getPrevVoiceText = () => '';
    static currentVoiceText = "";//当前的播放的文本

    // 初始化语音合成功能
    static init(here, next, prev) {
        if (this.isInit) return;
        this.getHere = here;
        this.isInit = true;
        this.getNextVoiceText = next;
        this.getPrevVoiceText = prev;
    }

    static isSpeaking() {
        return this.synth.speaking;
    }

    static async speak(content) {
        if (content != null) {
            this.currentVoiceText = content;
        } else {
            this.currentVoiceText = this.getHere();
        }

        if (!this.isInit) {
            console.error('Tts is not initialized. Call Tts.init() first.');
            return;
        }

        let utterance = new SpeechSynthesisUtterance(this.currentVoiceText);
        console.log('utterance', utterance);

        this.synth.speak(utterance);

        utterance.onend = async () => {
            if (this.current_tts_state === this.PLAY_STATE.PLAYING) {
                const nextText = await this.getNextVoiceText();
                if (nextText) {
                    this.currentVoiceText = nextText;
                    return this.speak(this.currentVoiceText);
                }
            }
        }
    }

    //记录上一次暂停或者停止的位置，用于播放上一个语音
    static async resumeSpeak() {
        if (this.current_tts_state === this.PLAY_STATE.PLAYING) {
            this.synth.resume();
            utterance.onend = async () => {
                if (this.current_tts_state === this.PLAY_STATE.PLAYING) {
                    const nextText = await this.getNextVoiceText();
                    if (nextText) {
                        this.currentVoiceText = nextText;
                        return this.speak(this.currentVoiceText);
                    }
                }
            }
        }
    }
    static updateTtsState(newState) {
        this.current_tts_state = newState;
    }

    // Pause the current speech
    static pause() {
        if (this.isSpeaking()) {
            this.synth.pause();
            this.updateTtsState(this.PLAY_STATE.PAUSED);
        }
    }

    // Resume the paused speech
    static resume() {
        if (this.synth.paused) {
            this.synth.resume();
            this.updateTtsState(this.PLAY_STATE.CONTINUED);
        }
    }
}