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

    static async getBookNote(bookKey) {
        const allBookNotes = await localforage.getItem('bookNotes');
        if (!allBookNotes) {
            return [];
        }
        console.log(allBookNotes);
        return allBookNotes.filter(bookNote => bookNote.bookKey === bookKey);
    }
}

export default BookNoteUtil