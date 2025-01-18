
import { defineStore } from 'pinia';
import { sysConfig } from '../config/sysConfig';

export const useSettingStore = defineStore('setting', {
    state: () => ({
        data: {
            ...sysConfig
        }
    }),

    getters: {
        currentBookName(state) {
            return this.data.currentBookName
        }
    },
    actions: {
        updateAllData(newData) {
            this.data = newData;
        },
        setBooksInfo(newBooksInfo) {
            this.data.booksInfo = newBooksInfo
        }
    },
    persist: {
        enabled: true,
        strategies: [
            {
                key: "setting",
                storage: localStorage,
                paths: ['data']
            }
        ]
    }
})