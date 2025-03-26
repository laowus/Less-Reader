export default class StyleUtil {
    /**
     * fontsize 字体大小
     * fontWeight 字体粗细
     * spacing / lineHeight 行距 
     * letterSpacing 字间距
     * wordSpacing 单词间距
     * textIndent 段落缩进
     * paragraphSpacing 段落间距
     * justify 是否两端对齐
     * hyphenate 是否自动连字符
    */
    static getStyle() {
        const defaultStyle = {
            fontSize: 14, fontWeight: 400, lineHeight: 1.7, letterSpacing: 2.0, wordSpacing: 2.5, textIndent: 2,
            paragraphSpacing: 1.0, justify: true, hyphenate: true, writingMode: "horizontal-tb",
        };
        let json = localStorage.getItem("style");
        return JSON.parse(json) || defaultStyle;
    }

    static setStyle(bookStyle) {
        localStorage.setItem("style", JSON.stringify(bookStyle));
    }

}