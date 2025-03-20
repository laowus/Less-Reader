export default class TtsData {

    static getTtsData() {
        //ttsVolume 音量 ttsPitch 音调 ttsRate 语速
        const defaultTtsData = {
            ttsVolume: 0.5, ttsPitch: 0.1, ttsRate: 0.8
        };
        let json = localStorage.getItem("ttsData");
        return JSON.parse(json) || defaultTtsData;
    }

    static setTtsData(ttsData) {
        localStorage.setItem("ttsData", JSON.stringify(ttsData));
    }

}