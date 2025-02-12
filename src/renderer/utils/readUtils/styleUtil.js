export default class StyleUtil {
    static getStyle() {
        let json = localStorage.getItem("style");
        let obj = JSON.parse(json || "{}");
        return obj || {};
    }

    static setStyle(bookStyle) {
        localStorage.setItem("style", JSON.stringify(bookStyle));
    }

}