export default class BookNote {
    constructor(id, bookKey, color, note, type, value) {
        this.id = id;
        this.bookKey = bookKey;
        this.color = color;
        this.note = note;
        this.type = type;
        this.value = value;
    }

    toMap() {
        return {
            id: this.id,
            bookKey: this.bookKey,
            color: this.color,
            note: this.note,
            type: this.type,
            value: this.value
        }
    }
}