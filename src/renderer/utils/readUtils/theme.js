export default class Theme {

    static baseThemes = [
        { label: '默认', backgroundColor: 'rgb(255,255,255)', fontColor: 'rgb(23,23,23)' },
        { label: '素雅', backgroundColor: 'rgb(224,224,224)', fontColor: 'rgb(34,34,34)' },
        { label: '旧韵', backgroundColor: 'rgb(241,232,208)', fontColor: 'rgb(91,70,54)' },
        { label: '青草', backgroundColor: 'rgb(215,219,189)', fontColor: 'rgb(35,44,22)' }
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