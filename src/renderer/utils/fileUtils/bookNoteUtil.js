import localforage from 'localforage';

class BookNoteUtil {

    static addBookNote(bookNote) {
        localforage.getItem('bookNotes').then((allBookNotes) => {
            if (!allBookNotes) {
                allBookNotes = [];
            }

            allBookNotes.forEach((element, index) => {
                if (element.bookKey === bookNote.bookKey && element.value === bookNote.value) {
                    allBookNotes.splice(index, 1);
                }
            });

            allBookNotes.push(bookNote);
            console.log(allBookNotes);
            localforage.setItem('bookNotes', allBookNotes);
        })
    }

    static isIn(bookNote) {

    }
}

export default BookNoteUtil