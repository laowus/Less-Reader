import { defineStore } from "pinia";
import EventBus from '../../common/EventBus';

export const useAppCommonStore = defineStore('appCommon', {
    state: () => ({
        //通用上下文菜单
        commonCtxMenuShow: false,
        commonCtxMenuData: [],
        commonCtxItem: {},  //菜单的上下文对象，用于公共参数传递
        commonCtxMenuCacheItem: {}, //菜单缓存对象，与具体点击的菜单项相关
    }),
    getters: {
    },
    actions: {
        updateCommonCtxItem(value) {
            this.commonCtxItem = value
        },
        updateCommonCtxMenuCacheItem(value) {
            this.commonCtxMenuCacheItem = value
        },
        showCommonCtxMenu(value) {
            this.commonCtxMenuShow = true
            this.updateCommonCtxMenuCacheItem(value)
        },
        hideCommonCtxMenu(clearCache) {
            this.commonCtxMenuShow = false
            if (clearCache) this.updateCommonCtxMenuCacheItem(null)
        },
    }
})