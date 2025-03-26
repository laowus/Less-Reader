export default class Book {
    constructor(id, key, name, author, description, md5, cover, format,
        publisher, size, page, frompath, path, charset, lastReadPosition = "", readingPercentage = "0", currentChapter = "") {
        this.id = id;
        this.key = key;
        this.name = name;
        this.author = author;
        this.description = description;
        this.md5 = md5;
        this.cover = cover;
        this.format = format;
        this.publisher = publisher;
        this.size = size;
        this.page = page;
        this.frompath = frompath;
        this.path = path;
        this.charset = charset;
        this.lastReadPosition = lastReadPosition;
        this.readingPercentage = readingPercentage;
        this.currentChapter = currentChapter
    }

    update(book) {
        this.key = book.key;
        this.name = book.name;
        this.author = book.author;
        this.description = book.description;
        this.md5 = book.md5;
        this.cover = book.cover;
        this.format = book.format;
        this.publisher = book.publisher;
        this.size = book.size;
        this.page = book.page;
        this.frompath = book.frompath;
        this.path = book.path;
        this.charset = book.charset;
        this.lastReadPosition = book.lastReadPosition;
        this.readingPercentage = book.readingPercentage;
        this.currentChapter = book.currentChapter;
    }

    toMap() {
        return {
            id: this.id,
            key: this.key,
            name: this.name,
            author: this.author,
            description: this.description,
            md5: this.md5,
            cover: this.cover,
            format: this.format,
            publisher: this.publisher,
            size: this.size,
            page: this.page,
            frompath: this.frompath,
            path: this.path,
            charset: this.charset,
            lastReadPosition: this.lastReadPosition,
            readingPercentage: this.readingPercentage,
            currentChapter: this.currentChapter
        }
    }
}

