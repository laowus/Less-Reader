import './view.js'
import { FootnoteHandler } from './ui/footnotes.js'
import { createTOCView } from './ui/tree.js'
import { Overlayer } from './ui/overlayer.js'
import RecordLocation from '../utils/readUtils/recordLocation.js';
import StyleUtil from '../utils/readUtils/styleUtil.js';
/**
 * fontsize 字体大小
 * spacing / lineHeight 行距 
 * letterSpacing 字间距
 * textIndent 段落缩进
 * paragraphSpacing 段落间距
 * justify 是否两端对齐
 * hyphenate 是否自动连字符
 */
const getCSS = ({ fontSize, lineHeight, letterSpacing, textIndent,
    paragraphSpacing, justify, hyphenate }) => `
    @namespace epub "http://www.idpf.org/2007/ops";
    html {
        color-scheme: light dark;
        letter-spacing: ${letterSpacing}px;
        font-size: ${fontSize}em;
    }
    /* https://github.com/whatwg/html/issues/5426 */
    @media (prefers-color-scheme: dark) {
        a:link {
            color: lightblue;
        }
    }

    * {
        line-height: ${lineHeight}em !important;
    }
    p, li, blockquote, dd, div, font  {
        line-height: ${lineHeight};
        padding-bottom: ${paragraphSpacing}em !important;
        text-align: ${justify ? 'justify' : 'start'};
        -webkit-hyphens: ${hyphenate ? 'auto' : 'manual'};
        hyphens: ${hyphenate ? 'auto' : 'manual'};
        -webkit-hyphenate-limit-before: 3;
        -webkit-hyphenate-limit-after: 2;
        -webkit-hyphenate-limit-lines: 2;
        hanging-punctuation: allow-end last;
        widows: 2;
        text-indent: ${textIndent}em !important;
    }
    /* prevent the above from overriding the align attribute */
    [align="left"] { text-align: left; }
    [align="right"] { text-align: right; }
    [align="center"] { text-align: center; }
    [align="justify"] { text-align: justify; }

    pre {
        white-space: pre-wrap !important;
    }
    aside[epub|type~="endnote"],
    aside[epub|type~="footnote"],
    aside[epub|type~="note"],
    aside[epub|type~="rearnote"] {
        display: none;
    }
`
const $ = document.querySelector.bind(document)
const locales = 'en'
const percentFormat = new Intl.NumberFormat(locales, { style: 'percent' })
const listFormat = new Intl.ListFormat(locales, { style: 'short', type: 'conjunction' })

const formatLanguageMap = x => {
    if (!x) return ''
    if (typeof x === 'string') return x
    const keys = Object.keys(x)
    return x[keys[0]]
}

const formatOneContributor = contributor => typeof contributor === 'string'
    ? contributor : formatLanguageMap(contributor?.name)

const formatContributor = contributor => Array.isArray(contributor)
    ? listFormat.format(contributor.map(formatOneContributor))
    : formatOneContributor(contributor)

const clickPart = (cx, cy) => {
    const x = cx / window.innerWidth
    const y = cy / window.innerHeight

    if (x < 0.33) {
        if (y < 0.33) {
            return 0;
        } else if (y < 0.66) {
            return 3;
        } else {
            return 6;
        }
    } else if (x < 0.66) {
        if (y < 0.33) {
            return 1;
        } else if (y < 0.66) {
            return 4;
        } else {
            return 7;
        }
    } else {
        if (y < 0.33) {
            return 2;
        } else if (y < 0.66) {
            return 5;
        } else {
            return 8;
        }
    }
}

const partAction = ["prev", "menu", "next", "prev", "menu", "next", "prev", "menu", "next"]

let style

class Reader {
    bookKey
    #tocView
    bookStyle
    annotations = new Map()
    annotationsByValue = new Map()
    #footnoteHandler = new FootnoteHandler()
    closeSideBar() {
        $('#dimming-overlay').classList.remove('show')
        $('#bottom-bar').classList.remove('show')
    }
    constructor() {
        $('#dimming-overlay').addEventListener('click', () => this.closeSideBar())

        this.#footnoteHandler.addEventListener('before-render', e => {
            const { view } = e.detail
            this.setView(view)
            replaceFootnote(view)
        })
    }

    async open(file, bookKey, cfi, bookStyle) {
        this.bookKey = bookKey
        //调用 view.js View
        this.view = document.createElement('foliate-view')
        //插入到body 尾部
        document.body.append(this.view)
        //打开文件
        await this.view.open(file)
        //初始化
        this.view.addEventListener('load', this.#onLoad.bind(this))
        this.view.addEventListener('relocate', this.#onRelocate.bind(this))
        this.view.addEventListener('click-view', this.#onClickView.bind(this))
        const { book } = this.view

        this.view.renderer.setStyles?.(getCSS(style))

        if (!cfi) this.view.renderer.next()
        await this.view.init({ lastLocation: cfi })

        $('#header-bar').style.visibility = 'visible'
        const slider = $('#progress-slider')
        slider.dir = book.dir
        slider.addEventListener('input', e =>
            this.view.goToFraction(parseFloat(e.target.value)))
        for (const fraction of this.view.getSectionFractions()) {
            const option = document.createElement('option')
            option.value = fraction
            $('#tick-marks').append(option)
        }
        //键盘监听
        document.addEventListener('keydown', this.#handleKeydown.bind(this))
        const title = formatLanguageMap(book.metadata?.title) || 'Untitled Book'
        document.title = title
        /**左边目录 */
        //书名 作者显示
        $('#side-bar-title').innerText = title
        $('#side-bar-author').innerText = formatContributor(book.metadata?.author)
        //封面
        Promise.resolve(book.getCover?.())?.then(blob =>
            blob ? $('#side-bar-cover').src = URL.createObjectURL(blob) : null)
        const toc = book.toc
        if (toc) {
            this.#tocView = createTOCView(toc, href => {
                this.view.goTo(href).catch(e => console.error(e))
                this.closeSideBar()
            })
            $('#toc-view').append(this.#tocView.element)
        }

        // load and show highlights embedded in the file by Calibre
        //获取书签
        const bookmarks = await book.getCalibreBookmarks?.()
        if (bookmarks) {
            const { fromCalibreHighlight } = await import('./tools/epubcfi.js')
            for (const obj of bookmarks) {
                if (obj.type === 'highlight') {
                    const value = fromCalibreHighlight(obj)
                    const color = obj.style.which
                    const note = obj.notes
                    const annotation = { value, color, note }
                    const list = this.annotations.get(obj.spine_index)
                    if (list) list.push(annotation)
                    else this.annotations.set(obj.spine_index, [annotation])
                    this.annotationsByValue.set(value, annotation)
                }
            }
            this.view.addEventListener('create-overlay', e => {
                const { index } = e.detail
                const list = this.annotations.get(index)
                if (list) for (const annotation of list)
                    this.view.addAnnotation(annotation)
            })
            this.view.addEventListener('draw-annotation', e => {
                const { draw, annotation } = e.detail
                const { color } = annotation
                draw(Overlayer.highlight, { color })
            })
            this.view.addEventListener('show-annotation', e => {
                const annotation = this.annotationsByValue.get(e.detail.value)
                if (annotation.note) alert(annotation.note)
            })
        }
    }

    #onClickView({ detail: { cx, cy } }) {
        console.log(cx, cy)
        const action = partAction[clickPart(cx, cy)]
        if (action === "prev") {
            this.view.goLeft()
        } else if (action === "next") {
            this.view.goRight()
        } else if (action === "menu") {
            $('#dimming-overlay').classList.add('show')
            $('#bottom-bar').classList.add('show')
        }
    }
    //键盘处理 
    #handleKeydown(event) {
        const k = event.key
        if (k === 'ArrowLeft' || k === 'h') this.view.goLeft()
        else if (k === 'ArrowRight' || k === 'l') this.view.goRight()
    }
    //doc 为当前的html页面
    #onLoad({ detail: { doc } }) {
        doc.addEventListener('keydown', this.#handleKeydown.bind(this))
    }
    //
    #onRelocate({ detail }) {
        console.log(detail)
        const { cfi, fraction, location, tocItem, pageItem, chapterLocation } = detail
        const percent = percentFormat.format(fraction)
        const loc = pageItem
            ? `Page ${pageItem.label}`
            : `Loc ${location.current}`
        const slider = $('#progress-slider')
        // slider.style.visibility = 'visible'
        slider.value = fraction
        slider.title = `${percent} · ${loc}`
        if (tocItem?.label) $('#chapter-title').innerText = tocItem?.label
        if (tocItem?.href) this.#tocView?.setCurrentHref?.(tocItem.href)
        //保存到当前阅读记录到localstorage中
        RecordLocation.recordHtmlLocation(this.bookKey, tocItem?.label, percent, cfi)
    }
}

export const open = async (file, bookKey, cfi, bookStyle) => {
    style = bookStyle || {
        fontSize: 1.0, lineHeight: 1.8, letterSpacing: 2.0, wordSpacing: 2.0,
        paragraphSpacing: 1.0, textIndent: 0, justify: true, hyphenate: true,
    };
    const reader = new Reader();
    globalThis.reader = reader;
    await reader.open(file, bookKey, cfi);
}


export const setStyle = (newStyle) => {

    style = {
        ...style,
        ...newStyle
    }

    reader.view.renderer.setStyles?.(getCSS(style));
    StyleUtil.setStyle(style);

}




