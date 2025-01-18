import { defineStore } from 'pinia';
//配置数据
export const useConfigStore = defineStore('config', {
    state: () => ({
        cates: ['默认', '喜欢']//书籍分类
    }),

    getters: {

    },
    actions: {

    },
    // persist: {
    //     enabled: true,
    //     strategies: [
    //         {
    //             key: "config",
    //             storage: localStorage,
    //             paths: ['cates']
    //         }
    //     ]
    // }
})