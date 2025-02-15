export default class StyleUtil {
    /**
     * fontsize 字体大小
     * spacing / lineHeight 行距 
     * letterSpacing 字间距
     * textIndent 段落缩进
     * paragraphSpacing 段落间距
     * justify 是否两端对齐
     * hyphenate 是否自动连字符
    */
    static getStyle() {
        const defaultStyle = {
            fontSize: 1.0, lineHeight: 1.7, letterSpacing: 2.0, textIndent: 5,
            paragraphSpacing: 1.0, justify: true, hyphenate: true,
        };
        let json = localStorage.getItem("style");
        return JSON.parse(json) || defaultStyle;
    }

    static setStyle(bookStyle) {
        localStorage.setItem("style", JSON.stringify(bookStyle));
    }

}