import TtsData from "./ttsData";

export default class Tts {

    static synth = window.speechSynthesis;
    static voices = this.synth.getVoices();
    static isInit = false;

    static getHere = () => "";
    static getNextVoiceText = () => '';
    static getPrevVoiceText = () => '';
    static currentVoiceText = "";//当前的播放的文本
    static getVoices() {
        const voices = this.synth.getVoices();
        return voices;
    }
    static utterance = null;

    // 初始化语音合成功能
    static init(here, next, prev) {
        if (this.isInit) return;
        this.getHere = here;
        this.isInit = true;
        this.getNextVoiceText = next;
        this.getPrevVoiceText = prev;
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

        this.initUtterace();
        this.synth.speak(this.utterance);

        this.utterance.onend = async () => {
            console.log('Speech synthesis ended.');
            const nextText = await this.getNextVoiceText();
            if (nextText) {
                this.currentVoiceText = nextText;
                return this.speak(this.currentVoiceText);
            }

        }
    }

    static setUtterance(ttsDataObj) {
        const newObj = { ...TtsData.getTtsData(), ...ttsDataObj };

        TtsData.setTtsData(newObj);
        if (this.synth.speaking) {
            this.synth.pause();
            this.utterance.volume = newObj.ttsVolume;
            this.utterance.rate = newObj.ttsRate;
            this.utterance.pitch = newObj.ttsPitch;
            this.utterance.voice = this.voices[newObj.ttsVoiceIndex];
            this.synth.resume();
        }

    }

    static initUtterace() {
        this.utterance = new SpeechSynthesisUtterance(this.currentVoiceText);
        const ttsDataObj = TtsData.getTtsData();
        this.utterance.volume = ttsDataObj.ttsVolume;
        this.utterance.rate = ttsDataObj.ttsRate;
        this.utterance.pitch = ttsDataObj.ttsPitch;
        this.utterance.voice = this.voices[ttsDataObj.ttsVoiceIndex || 0];
    }


    static async speakPrev() {
        if (this.synth.speaking) {
            this.synth.cancel();
            const prevText = await this.getPrevVoiceText();
            if (prevText) {
                this.currentVoiceText = prevText;
                return this.speak(this.currentVoiceText);
            }
        }
    }

    static async speakNext() {
        if (this.synth.speaking) {
            this.synth.cancel();
            const nextText = await this.getNextVoiceText();
            if (nextText) {
                this.currentVoiceText = nextText;
                return this.speak(this.currentVoiceText);
            }
        }
    }

    //记录上一次暂停或者停止的位置，用于播放上一个语音
    static async resumeSpeak() {
        if (this.synth.paused) {
            this.synth.resume();
            this.utterance.onend = async () => {
                const nextText = await this.getNextVoiceText();
                if (nextText) {
                    this.currentVoiceText = nextText;
                    return this.speak(this.currentVoiceText);
                }
            }
        }
    }


    // Pause the current speech
    static pause() {
        if (this.synth.speaking) {
            this.synth.pause();
        }
    }

    // Resume the paused speech
    static resume() {
        if (this.synth.paused) {
            this.synth.resume();
        }
    }

    static stop() {
        this.synth.cancel();
        window.ttsStop();
    }
}