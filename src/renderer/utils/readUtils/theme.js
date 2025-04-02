export default class Theme {

    static baseThemes = [
        { label: '默认', backgroundColor: '#ffffff', fontColor: '#171717', btnBgColor: '#cccccc' },
        { label: '暗黑', backgroundColor: '#171717', fontColor: '#ffffff', btnBgColor: '#4a4a4a' },
        { label: '灰色', backgroundColor: '#e0e0e0', fontColor: '#222222', btnBgColor: '#adadad' },
        { label: '旧韵', backgroundColor: '#f1e8d0', fontColor: '#5b4636', btnBgColor: '#dac281' },
        { label: '老韵', backgroundColor: '#342e25', fontColor: '#ffd595', btnBgColor: '#70634f' },
        { label: '青草', backgroundColor: '#d7dbbd', fontColor: '#232c16', btnBgColor: '#afb77b' },
        { label: '秋草', backgroundColor: '#333627', fontColor: '#d8deba', btnBgColor: '#6b7152' },
        { label: '樱桃', backgroundColor: '#f0d1d5', fontColor: '#4e1609', btnBgColor: '#d7848f' },
        { label: '殷桃', backgroundColor: '#462f32', fontColor: '#e5c4c8', btnBgColor: '#83585e' },
        { label: '天青', backgroundColor: '#cedef5', fontColor: '#262d48', btnBgColor: '#79a5e4' },
        { label: '暖橘', backgroundColor: '#fbf1c7', fontColor: '#3c3836', btnBgColor: '#f4d968' },
        { label: '暖橘（暗）', backgroundColor: '#282828', fontColor: '#ebdbb2', btnBgColor: '#5b5b5b' },
    ]

    static getThemes() {
        const json = localStorage.getItem("themes");
        return JSON.parse(json) || this.baseThemes;
    }
    static deleteTheme(label) {
        let themes = this.getThemes().filter(item => item.label !== label);
        localStorage.setItem("themes", JSON.stringify(themes));
    }

    static addTheme(theme) {
        if (this.isExist(theme)) {
            return false;
        } else {
            let themes = this.getThemes();
            themes.push(theme);
            localStorage.setItem("themes", JSON.stringify(themes));
            return true;
        }
    }

    static removeTheme(theme) {
        let themes = this.getThemes();
        themes = themes.filter(item => item.label !== theme.label);
        localStorage.setItem("themes", JSON.stringify(themes));
    }

    static isExist(theme) {
        let themes = this.getThemes();
        return themes.some(item => item.label === theme.label);
    }

}