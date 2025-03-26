export default class Note {
    constructor(id, bookId, color, note, type, cfi, chapter) {
        this.id = id;
        this.bookId = bookId;
        this.color = color;
        this.note = note;
        this.type = type;
        this.cfi = cfi;
        this.chapter = chapter;

    }

    toMap() {
        return {
            id: this.id,
            bookId: this.bookId,
            color: this.color,
            note: this.note,
            type: this.type,
            cfi: this.cfi,
            chapter: this.chapter
        }
    }

    updateId(newid) {
        this.id = newid;
    }
}