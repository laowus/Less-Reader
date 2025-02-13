export default class StyleUtil {

    static getStyle() {
        const defaultStyle = {
            fontSize: 1.0, lineHeight: 1.8, letterSpacing: 2.0, wordSpacing: 2.0,
            paragraphSpacing: 1.0, textIndent: 2.5, justify: true, hyphenate: true,
        };
        let json = localStorage.getItem("style");
        return JSON.parse(json) || defaultStyle;
    }

    static setStyle(bookStyle) {
        localStorage.setItem("style", JSON.stringify(bookStyle));
    }

}