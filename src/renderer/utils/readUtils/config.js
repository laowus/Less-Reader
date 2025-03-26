export default class Config {
    /**
     * leftbarShow 显示左边栏（默认隐藏）
    */
    static getConfig() {
        const defaultConfig = {
            leftbarShow: false
        };
        let json = localStorage.getItem("config");
        return JSON.parse(json) || defaultConfig;
    }

    static setConfig(config) {
        localStorage.setItem("config", JSON.stringify(config));
    }

}