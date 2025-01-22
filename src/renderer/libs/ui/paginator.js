const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const makeMarginals = (length, part) => Array.from({ length }, () => {
    const div = document.createElement('div')
    const child = document.createElement('div')
    div.append(child)
    child.setAttribute('part', part)
    return div
})
const setStylesImportant = (el, styles) => {
    const { style } = el
    for (const [k, v] of Object.entries(styles)) style.setProperty(k, v, 'important')
}

class View {
    #observer = new ResizeObserver(() => this.expand())
    #element = document.createElement('div')
    #iframe = document.createElement('iframe')
    #contentRange = document.createRange()
    #vertical = false
    #size
    #layout = {}
    constructor({ container, onExpand }) {
        console.log("06 View  constructor", onExpand)
        this.container = container
        this.onExpand = onExpand
        this.#iframe.setAttribute('part', 'filter')
        this.#element.append(this.#iframe)
        Object.assign(this.#element.style, {
            boxSizing: 'content-box',
            position: 'relative',
            overflow: 'hidden',
            flex: '0 0 auto',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        })
        Object.assign(this.#iframe.style, {
            overflow: 'hidden',
            border: '0',
            display: 'none',
            width: '100%',
            height: '100%',
        })
        this.#iframe.setAttribute('scrolling', 'no')
    }
    get element() {
        return this.#element
    }
    get document() {
        return this.#iframe.contentDocument
    }
    //加载HTML文件
    async load(src, beforeRender) {
        console.log("07 View  load(", src, beforeRender)
        if (typeof src !== 'string') throw new Error(`${src} is not string`)
        return new Promise(resolve => {
            this.#iframe.addEventListener('load', () => {
                const doc = this.document
                //doc.body放入range中
                this.#contentRange.selectNodeContents(doc.body)
                const layout = beforeRender()
                this.#iframe.style.display = 'block'
                console.log("07 layout", layout)
                //设置html和body style css
                this.render(layout)
                this.#observer.observe(doc.body)
                doc.fonts.ready.then(() => this.expand())
                resolve()
            }, { once: true })
            this.#iframe.src = src
        })
    }
    render(layout) {
        console.log('07 render(layout)')
        if (!layout) return
        this.#layout = layout
        this.columnize(layout)
    }
    scrolled({ gap, columnWidth }) {
        const doc = this.document
        setStylesImportant(doc.documentElement, {
            'box-sizing': 'border-box',
            'padding': `0 ${gap}px`,
            'column-width': 'auto',
            'height': 'auto',
            'width': 'auto',
        })
        setStylesImportant(doc.body, {
            ['max-width']: `${columnWidth}px`,
            'margin': 'auto',
        })
        this.setImageSize()
        this.expand()
    }
    //设置html文件的html body
    columnize({ width, height, gap, columnWidth }) {
        console.log('08 columnize')
        this.#size = width
        const doc = this.document//iframe
        console.log('08 setStylesImportant 设置iframe 内部html的css')
        setStylesImportant(doc.documentElement, {
            'box-sizing': 'border-box',
            'column-width': `${Math.trunc(columnWidth)}px`,
            'column-gap': `${gap}px`,
            'column-fill': 'auto',
            'height': `${height}px`,
            'padding': `0 ${gap / 2}px`,
            'overflow': 'hidden',
            // force wrap long words
            'overflow-wrap': 'break-word',
            // reset some potentially problematic props
            'position': 'static', 'border': '0', 'margin': '0',
            'max-height': 'none', 'max-width': 'none',
            'min-height': 'none', 'min-width': 'none',
            // fix glyph clipping in WebKit
            '-webkit-line-box-contain': 'block glyphs replaced',
        })
        setStylesImportant(doc.body, {
            'max-height': 'none',
            'max-width': 'none',
            'margin': '0',
        })
        this.setImageSize()
        this.expand()
    }
    setImageSize() {
        const { height, margin } = this.#layout
        const doc = this.document
        for (const el of doc.body.querySelectorAll('img, svg, video')) {
            const { maxWidth } = doc.defaultView.getComputedStyle(el)
            setStylesImportant(el, {
                'max-height': `${height - margin * 2}px`,
                'max-width': (maxWidth !== 'none' && maxWidth !== '0px' ? maxWidth : '100%'),
                'object-fit': 'contain',
                'page-break-inside': 'avoid',
                'break-inside': 'avoid',
                'box-sizing': 'border-box',
            })
        }
    }
    expand() {
        console.log("08 expand")
        const { documentElement } = this.document
        //获取html实际宽度
        const contentRect = this.#contentRange.getBoundingClientRect()
        //获取显示宽度
        const rootRect = documentElement.getBoundingClientRect()
        console.log("进行分页, 测量 expand()", "contentRect.left", contentRect.left, "rootRect.left", rootRect.left)
        const contentStart = contentRect.left - rootRect.left
        console.log("const contentStart = contentRect.left - rootRect.left", contentStart)
        const contentSize = contentStart + contentRect['width']
        console.log("实际内容大小 contentSize", contentSize)
        const pageCount = Math.ceil(contentSize / this.#size)
        console.log("pageCount", pageCount, contentSize, '/', this.#size, contentSize / this.#size)
        const expandedSize = pageCount * this.#size
        this.#element.style.padding = '0'
        this.#iframe.style['width'] = `${expandedSize}px`
        this.#element.style['width'] = `${expandedSize + this.#size * 2}px`
        this.#iframe.style['height'] = '100%'
        this.#element.style['height'] = '100%'
        documentElement.style['width'] = `${this.#size}px`
        this.onExpand()
    }
    destroy() {
        if (this.document) this.#observer.unobserve(this.document.body)
    }
}

export class Paginator extends HTMLElement {
    static observedAttributes = [
        'flow', 'gap', 'margin',
        'max-inline-size', 'max-block-size', 'max-column-count',
    ]
    #root = this.attachShadow({ mode: 'closed' })
    #observer = new ResizeObserver(() => this.render())
    #top
    #container
    #header
    #footer
    #view
    #margin = 0
    #index = -1
    #anchor = 0 // anchor view to a fraction (0-1), Range, or Element
    #locked = false // while true, prevent any further navigation
    #styles
    #mediaQuery = matchMedia('(prefers-color-scheme: dark)')
    #mediaQueryListener
    constructor() {
        super()
        this.#root.innerHTML = `<style>
        :host {
            display: block;
            container-type: size;
        }
        :host, #top {
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            width: 100%;
            height: 100%;
        }
        #top {
            --_gap: 7%;
            --_margin: 48px;
            --_max-inline-size: 720px;
            --_max-block-size: 1440px;
            --_max-column-count: 2;
            --_max-column-count-portrait: 1;
            --_max-column-count-spread: var(--_max-column-count);
            --_half-gap: calc(var(--_gap) / 2);
            --_max-width: calc(var(--_max-inline-size) * var(--_max-column-count-spread));
            --_max-height: var(--_max-block-size);
            display: grid;
            grid-template-columns:
                minmax(var(--_half-gap), 1fr)
                var(--_half-gap)
                minmax(0, calc(var(--_max-width) - var(--_gap)))
                var(--_half-gap)
                minmax(var(--_half-gap), 1fr);
            grid-template-rows:
                minmax(var(--_margin), 1fr)
                minmax(0, var(--_max-height))
                minmax(var(--_margin), 1fr);
            &.vertical {
                --_max-column-count-spread: var(--_max-column-count-portrait);
                --_max-width: var(--_max-block-size);
                --_max-height: calc(var(--_max-inline-size) * var(--_max-column-count-spread));
            }
            @container (orientation: portrait) {
                & {
                    --_max-column-count-spread: var(--_max-column-count-portrait);
                }
                &.vertical {
                    --_max-column-count-spread: var(--_max-column-count);
                }
            }
        }
        #background {
            grid-column: 1 / -1;
            grid-row: 1 / -1;
        }
        #container {
            grid-column: 2 / 5;
            grid-row: 2;
            overflow: hidden;
        }
        :host([flow="scrolled"]) #container {
            grid-column: 1 / -1;
            grid-row: 1 / -1;
            overflow: auto;
        }
        #header {
            grid-column: 3 / 4;
            grid-row: 1;
        }
        #footer {
            grid-column: 3 / 4;
            grid-row: 3;
            align-self: end;
        }
        #header, #footer {
            display: grid;
            height: var(--_margin);
        }
        :is(#header, #footer) > * {
            display: flex;
            align-items: center;
            min-width: 0;
        }
        :is(#header, #footer) > * > * {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            text-align: center;
            font-size: .75em;
            opacity: .6;
        }
        </style>
        <div id="top">
            <div id="background" part="filter"></div>
            <div id="header"></div>
            <div id="container"></div>
            <div id="footer"></div>
        </div>
        `
        this.#top = this.#root.getElementById('top')
        this.#container = this.#root.getElementById('container')
        this.#header = this.#root.getElementById('header')
        this.#footer = this.#root.getElementById('footer')
        this.#observer.observe(this.#container)
    }
    open(book) {
        this.bookDir = book.dir
        this.sections = book.sections
    }
    #createView() {
        console.log("05 #createView")
        if (this.#view) {
            this.#view.destroy()
            this.#container.removeChild(this.#view.element)
        }
        this.#view = new View({
            container: this,
            onExpand: () => this.#scrollToAnchor(),
        })
        this.#container.append(this.#view.element)
        return this.#view
    }
    #beforeRender() {
        const { width, height } = this.#container.getBoundingClientRect()
        const size = width
        const style = getComputedStyle(this.#top)
        const maxInlineSize = parseFloat(style.getPropertyValue('--_max-inline-size'))
        const maxColumnCount = parseInt(style.getPropertyValue('--_max-column-count-spread'))
        const margin = parseFloat(style.getPropertyValue('--_margin'))
        this.#margin = margin
        const g = parseFloat(style.getPropertyValue('--_gap')) / 100
        const gap = -g / (g - 1) * size
        const divisor = Math.min(maxColumnCount, Math.ceil(size / maxInlineSize))
        const columnWidth = (size / divisor) - gap
        this.setAttribute('dir', 'ltr')
        const marginalDivisor = divisor
        const marginalStyle = {
            gridTemplateColumns: `repeat(${marginalDivisor}, 1fr)`,
            gap: `${gap}px`,
            direction: this.bookDir === 'rtl' ? 'rtl' : 'ltr',
        }
        Object.assign(this.#header.style, marginalStyle)
        Object.assign(this.#footer.style, marginalStyle)
        const heads = makeMarginals(marginalDivisor, 'head')
        const feet = makeMarginals(marginalDivisor, 'foot')
        this.heads = heads.map(el => el.children[0])
        this.feet = feet.map(el => el.children[0])
        this.#header.replaceChildren(...heads)
        this.#footer.replaceChildren(...feet)
        return { height, width, margin, gap, columnWidth }
    }
    render() {
        if (!this.#view) return
        this.#view.render(this.#beforeRender())
    }
    get size() {
        return this.#container.getBoundingClientRect()['width']
    }
    get viewSize() {
        return this.#view.element.getBoundingClientRect()['width']
    }
    get start() {
        return Math.abs(this.#container['scrollLeft'])
    }
    get end() {
        return this.start + this.size
    }
    get page() {
        return Math.floor(((this.start + this.end) / 2) / this.size)
    }
    get pages() {
        return Math.round(this.viewSize / this.size)
    }
    async #scrollTo(offset) {
        this.#container.scrollLeft = offset
    }
    async #scrollToPage(page) {
        const offset = this.size * page//偏移
        return this.#scrollTo(offset)
    }
    //重新布局 跳到第一页
    async #scrollToAnchor() {
        const { pages } = this
        if (!pages) return
        await this.#scrollToPage(1)
    }
    async #display(promise) {//04 这里创建view
        console.log("04 #display", promise)
        const { index, src } = await promise
        this.#index = index //存储index
        if (src) {
            const view = this.#createView()
            const beforeRender = this.#beforeRender.bind(this)
            await view.load(src, beforeRender)
            this.#view = view
        }
        await this.#scrollToAnchor()
    }
    #canGoToIndex(index) {
        return index >= 0 && index <= this.sections.length - 1
    }
    // 03 
    async #goTo({ index }) {//anchor 0 / 1
        console.log("03 #goTo", index)
        if (index === this.#index) await this.#display({ index, anchor, select })
        else {
            //获取src index
            await this.#display(Promise.resolve(this.sections[index].load())
                .then(src => ({ index, src }))
                .catch(e => {
                    console.warn(e)
                    console.warn(new Error(`Failed to load section ${index}`))
                    return {}
                }))
        }
    }
    async goTo(target) {
        if (this.#locked) return
        const resolved = await target
        if (this.#canGoToIndex(resolved.index)) return this.#goTo(resolved)
    }
    #scrollPrev() {
        if (!this.#view) return true
        if (this.atStart) return
        const page = this.page - 1
        return this.#scrollToPage(page, 'page', true).then(() => page <= 0)
    }
    #scrollNext() {
        if (!this.#view) return true
        if (this.atEnd) return
        const page = this.page + 1
        const pages = this.pages
        return this.#scrollToPage(page, 'page').then(() => page >= pages - 1)
    }
    get atStart() {
        return this.#adjacentIndex(-1) == null && this.page <= 1
    }
    get atEnd() {
        return this.#adjacentIndex(1) == null && this.page >= this.pages - 2
    }
    #adjacentIndex(dir) {// return this.#index -1 或者 + 1
        for (let index = this.#index + dir; this.#canGoToIndex(index); index += dir) {
            if (this.sections[index]?.linear !== 'no') return index
        }
    }
    async #turnPage(dir) {//dir=1
        console.log("02 #turnPage")
        if (this.#locked) return
        this.#locked = true
        const prev = dir === -1
        const shouldGo = await (prev ? this.#scrollPrev() : this.#scrollNext())
        if (shouldGo) await this.#goTo({ index: this.#adjacentIndex(dir) })
        if (shouldGo || !this.hasAttribute('animated')) await wait(100)
        this.#locked = false
    }
    prev() {
        return this.#turnPage(-1)
    }
    next() {
        console.log("01 开始 next()")
        return this.#turnPage(1)
    }
    prevSection() {
        return this.goTo({ index: this.#adjacentIndex(-1) })
    }
    nextSection() {
        return this.goTo({ index: this.#adjacentIndex(1) })
    }
    firstSection() {
        const index = this.sections.findIndex(section => section.linear !== 'no')
        return this.goTo({ index })
    }
    lastSection() {
        const index = this.sections.findLastIndex(section => section.linear !== 'no')
        return this.goTo({ index })
    }
    destroy() {
        this.#observer.unobserve(this)
        this.#view.destroy()
        this.#view = null
        this.sections[this.#index]?.unload?.()
        this.#mediaQuery.removeEventListener('change', this.#mediaQueryListener)
    }
}
customElements.define('foliate-paginator', Paginator)
