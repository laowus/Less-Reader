class RecordLocation {
    //获取存储的记录
    static getCfi(bookKey) {
        let json = localStorage.getItem("recordLocation");
        let obj = JSON.parse(json || "{}");
        return obj[bookKey] || {};
    }
    //
    static recordHtmlLocation(bookKey, text, chapterTitle, chapterDocIndex,
        chapterHref, count, percentage, cfi, page) {
        if (cfi) {
            let json = localStorage.getItem("recordLocation");
            let obj = JSON.parse(json || "{}");
            obj[bookKey] = {
                text, chapterDocIndex, chapterHref, count,
                percentage, cfi, page
            };
            localStorage.setItem("recordLocation", JSON.stringify(obj));
        } else {
            let json = localStorage.getItem("recordLocation");
            let obj = JSON.parse(json || "{}");
            obj[bookKey] = {
                text, chapterTitle, chapterDocIndex, chapterHref,
                count, percentage, cfi, page
            };
            localStorage.setItem("recordLocation", JSON.stringify(obj));
        }
    }

}