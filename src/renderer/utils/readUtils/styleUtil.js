
import Theme from "./theme";

export default class StyleUtil {

    static themes = [
        { value: 'default', label: '默认', backgroundColor: 'rgb(255,255,255)', fontColor: 'rgb(23,23,23)' },
        { value: 'elegant', label: '素雅', backgroundColor: 'rgb(224,224,224)', fontColor: 'rgb(34,34,34)' },
        { value: 'vintage', label: '旧韵', backgroundColor: 'rgb(241,232,208)', fontColor: 'rgb(91,70,54)' },
        { value: 'grass', label: '青草', backgroundColor: 'rgb(215,219,189)', fontColor: 'rgb(35,44,22)' },
        // { value: 'cherry', label: '樱粉', backgroundColor: 'rgb(240,209,213)', fontColor: 'rgb(78,22,9)' },
        // { value: 'sky', label: '天青', backgroundColor: 'rgb(206,222,245)', fontColor: 'rgb(38,45,72)' },
        // { value: 'solarized', label: '日晖', backgroundColor: 'rgb(253,246,227)', fontColor: 'rgb(88,110,117)' },
        // { value: 'gruvbox', label: '暖橘', backgroundColor: 'rgb(251,241,199)', fontColor: 'rgb(60,56,54)' },
        // { value: 'nord', label: '极光', backgroundColor: 'rgb(236,239,244)', fontColor: 'rgb(46,52,64)' },
        // { value: 'contrast', label: '对比', backgroundColor: 'rgb(255,255,255)', fontColor: 'rgb(0,0,0)' },
        // { value: 'sunset', label: '日落', backgroundColor: 'rgb(255,247,240)', fontColor: 'rgb(66,49,38)' }
    ];
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
            fontColor: Theme.getThemes()[0].fontColor, backgroundColor: Theme.getThemes()[0].backgroundColor, fontFamily: "Microsoft YaHei"
        };
        let json = localStorage.getItem("style");
        return JSON.parse(json) || defaultStyle;
    }

    static setStyle(bookStyle) {
        localStorage.setItem("style", JSON.stringify(bookStyle));
    }

    static getThemeIndex() {
        // 获取当前的样式
        const currentStyle = this.getStyle();
        // 查找匹配的主题索引
        const index = Theme.getThemes().findIndex(item => item.backgroundColor === currentStyle.backgroundColor && item.fontColor === currentStyle.fontColor);
        // 如果没有找到匹配的索引，返回 0
        return index !== -1 ? index : 0;
    }




}