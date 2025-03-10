
class BookNoteUtil {

    static addBookNote(bookNote) {
        let bookNotes = localStorage.getItem("bookNotes");
        bookNotes = bookNotes ? JSON.parse(bookNotes) : [];
        bookNotes = bookNotes.filter(element => !(element.bookId == bookNote.bookId && element.cfi == bookNote.cfi));
        bookNotes.push(bookNote);
        localStorage.setItem("bookNotes", JSON.stringify(bookNotes));
    }

    static getBookNote(bookId) {
        let bookNotes = localStorage.getItem("bookNotes");
        bookNotes = bookNotes ? JSON.parse(bookNotes) : [];
        console.log(bookNotes);
        return bookNotes.filter(element => element.bookId == bookId);
    }
}

export default BookNoteUtil