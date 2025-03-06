export default class Book {
    constructor(key, name, author, description, md5, cover, format, publisher, size, page, path, charset) {
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
        this.path = path;
        this.charset = charset;
    }

    toMap() {
        return {
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
            path: this.path,
            charset: this.charset,
        }
    }
}

