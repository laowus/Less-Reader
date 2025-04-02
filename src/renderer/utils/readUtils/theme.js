export default class Theme {

    static baseThemes = [
        { label: '默认', backgroundColor: '#ffffff', fontColor: '#171717', btnBgColor: '#0066cc' },
        { label: '灰色', backgroundColor: '#e0e0e0', fontColor: '#222222', btnBgColor: '#4488cc' },
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