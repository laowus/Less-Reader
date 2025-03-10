export default class Note {
    constructor(id, bookId, color, note, type, cfi) {
        this.id = id;
        this.bookId = bookId;
        this.color = color;
        this.note = note;
        this.type = type;
        this.cfi = cfi;
    }

    toMap() {
        return {
            id: this.id,
            bookId: this.bookId,
            color: this.color,
            note: this.note,
            type: this.type,
            cfi: this.cfi
        }
    }
}