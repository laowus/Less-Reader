export default class NoteStyle {

    static colors = ['red', 'blueviolet', 'blue', 'green', 'yellow'];
    static tys = ['highlight', 'underline', 'squiggly'];

    static getNoteStyle() {
        const defaultStyle = {
            color: this.colors[0], ty: this.tys[0]
        };
        let json = localStorage.getItem("noteStyle");
        return JSON.parse(json) || defaultStyle;
    }

    static setNoteStyle(noteStyle) {
        localStorage.setItem("noteStyle", JSON.stringify(noteStyle));
    }

}