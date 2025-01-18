import { defineStore } from 'pinia';

export const useBookStore = defineStore('book', {
    state: () => ({
        allBooks: [],
        cates: ['默认', '喜欢']
    }),
    getters: {

    },
    actions: {
        resetAllBooks() {
            this.allBooks.length = 0
        },
        addBook(book) {
            this.allBooks.push(book)
        },
        addBooks(books) {
            if (books.length < 1) return
            books.forEach(item => this.addBook(item));
        },
        removeBook(book) {
            //删除书籍
        },
        //books 为数组 传入必须是数组
        changeCate(books, cateId) {
            if (books.length < 1) return
            books.forEach(item => item.changeCate(cateId));
        }
    },
    persist: {
        enabled: true,
        strategies: [
            {
                key: "book",
                storage: localStorage,
                paths: ['allBooks', 'cates']
            }
        ]
    }
})