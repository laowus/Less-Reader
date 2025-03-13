<script setup>


</script>

<template>
    <div class="sidebar-container">
        <div class="flex-shrink-0">
            <div class="sidebar-header">
                <div class="sidebar-header-left">
                    <div class="iconfont-btn">
                        <span class="iconfont icon-library"></span>
                    </div>
                </div>
                <div class="sidebar-header-right">
                    <div class="iconfont-btn">
                        <span class="iconfont icon-sousuo1"></span>
                    </div>
                    <div class="iconfont-btn">
                        <span class="iconfont icon-gengduo"></span>
                    </div>
                    <div class="iconfont-btn">
                        <span class="iconfont icon-relieve"></span>
                    </div>
                </div>
            </div>
        </div>
        <div id="side-bar-header">
            <img id="side-bar-cover" />
            <div>
                <h1 id="side-bar-title"></h1>
                <p id="side-bar-author"></p>
            </div>
        </div>
        <div id="toc-view"></div>
    </div>
</template>

<style>
.sidebar-container {
    border-bottom-left-radius: 10px;
    border-top-left-radius: 10px;
    z-index: 20;
    display: flex;
    opacity: 1;
    height: 100%;
    min-width: 15rem;
    user-select: none;
    flex-direction: column;
    width: 15%;
    max-width: 45%;
    position: absolute;
    background-color: #fff;
}

.flex-shrink-0 {
    flex-shrink: 0;
}

.sidebar-header {
    display: flex;
    padding-right: .5rem;
    padding-left: .375rem;
    justify-content: space-between;
    align-items: center;
    height: 2.75rem;
}

.sidebar-header-left {
    display: flex;
    align-items: center;
    column-gap: 2rem;
}

.sidebar-header-right {
    display: flex;
    justify-content: space-between;
    width: 70%;
    height: 70%;
    max-width: 8rem;
    align-items: center;
    min-width: 6rem;
}

.iconfont-btn {
    margin-right: 1rem;
    width: 2rem;
    min-height: 2rem;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.iconfont-btn:hover {
    background-color: gainsboro;
    cursor: pointer;
    border-radius: 10px;
}

.iconfont-btn .iconfont {
    font-size: 1.3rem;
}

#side-bar-header {
    padding: 1rem;
    display: flex;
    border-bottom: 1px solid rgba(0, 0, 0, .1);
    align-items: center;
}

#toc-view {
    padding: .5rem;
    overflow-y: auto;
}

#toc-view li,
#toc-view ol {
    margin: 0;
    padding: 0;
    list-style: none;
}

#toc-view a,
#toc-view span {
    display: block;
    border-radius: 6px;
    padding: 8px;
    margin: 2px 0;
}

#toc-view a {
    color: CanvasText;
    text-decoration: none;
}

#toc-view a:hover {
    background: var(--active-bg);
}

#toc-view span {
    color: GrayText;
}

#toc-view svg {
    margin-inline-start: -24px;
    padding-inline-start: 5px;
    padding-inline-end: 6px;
    fill: CanvasText;
    cursor: default;
    transition: transform .2s ease;
    opacity: .5;
}

#toc-view svg:hover {
    opacity: 1;
}

#toc-view [aria-current] {
    font-weight: bold;
    background: var(--active-bg);
}

#toc-view [aria-expanded="false"] svg {
    transform: rotate(-90deg);
}

#toc-view [aria-expanded="false"]+[role="group"] {
    display: none;
}

#side-bar-cover {
    height: 10vh;
    min-height: 60px;
    max-height: 180px;
    border-radius: 3px;
    border: 0;
    background: lightgray;
    box-shadow: 0 0 1px rgba(0, 0, 0, .1), 0 0 16px rgba(0, 0, 0, .1);
    margin-inline-end: 1rem;
}

#side-bar-cover:not([src]) {
    display: none;
}

#side-bar-title {
    margin: .5rem 0;
    font-size: inherit;
}

#side-bar-author {
    margin: .5rem 0;
    font-size: small;
    color: GrayText;
}
</style>
