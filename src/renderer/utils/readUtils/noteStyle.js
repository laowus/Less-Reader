export default class NoteStyle {

    static colors = ['red', 'blueviolet', 'blue', 'green', 'yellow'];
    static types = ['highlight', 'underline', 'squiggly'];

    static getNoteStyle() {
        const defaultStyle = {
            color: this.colors[0], type: this.types[0]
        };
        let json = localStorage.getItem("noteStyle");
        return JSON.parse(json) || defaultStyle;
    }

    static setNoteStyle(noteStyle) {
        localStorage.setItem("noteStyle", JSON.stringify(noteStyle));
    }

}