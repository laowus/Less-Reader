export default class Theme {

    static baseThemes = [
        { label: '默认', backgroundColor: '#ffffff', fontColor: '#171717' },
        { label: '素雅', backgroundColor: '#e0e0e0', fontColor: '#222222' },
        { label: '旧韵', backgroundColor: '#f1e8d0', fontColor: '#5b4636' },
        { label: '青草', backgroundColor: '#d7dbbd', fontColor: '#232c16' }
    ]

    static getThemes() {
        const json = localStorage.getItem("themes");
        return JSON.parse(json) || this.baseThemes;
    }

    static addTheme(theme) {
        let themes = this.getThemes();
        themes.push(theme);
        localStorage.setItem("themes", JSON.stringify(themes));
    }

    static removeTheme(theme) {
        let themes = this.getThemes();
        themes = themes.filter(item => item.label !== theme.label);
        localStorage.setItem("themes", JSON.stringify(themes));
    }

}