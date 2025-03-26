class RecordLocation {
    //获取存储的记录
    static getCfi(bookKey) {
        let json = localStorage.getItem("recordLocation");
        let obj = JSON.parse(json || "{}");
        return obj[bookKey] || {};
    }
    //
    static recordHtmlLocation(bookKey, chapterTitle, percentage, cfi) {

        let json = localStorage.getItem("recordLocation");
        let obj = JSON.parse(json || "{}");
        obj[bookKey] = { chapterTitle, percentage, cfi };
        localStorage.setItem("recordLocation", JSON.stringify(obj));

    }

    static getHtmlLocation(bookKey) {
        let json = localStorage.getItem("recordLocation");
        let obj = JSON.parse(json || "{}");
        return obj[bookKey] || {};
    }

}

export default RecordLocation