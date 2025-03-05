
class BookNoteUtil {

    static addBookNote(bookNote) {
        let bookNotes = localStorage.getItem("bookNotes");
        bookNotes = bookNotes ? JSON.parse(bookNotes) : [];
        bookNotes = bookNotes.filter(element => !(element.bookKey === bookNote.bookKey && element.value === bookNote.value));
        bookNotes.push(bookNote);
        localStorage.setItem("bookNotes", JSON.stringify(bookNotes));
    }

    static getBookNote(bookKey) {
        let bookNotes = localStorage.getItem("bookNotes");
        bookNotes = bookNotes ? JSON.parse(bookNotes) : [];
        return bookNotes.filter(element => element.bookKey === bookKey);
    }
}

export default BookNoteUtil