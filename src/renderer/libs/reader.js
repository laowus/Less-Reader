import './view.js'
import { FootnoteHandler } from './ui/footnotes.js'
import { createTOCView } from './ui/tree.js'
import { Overlayer } from './ui/overlayer.js'
import StyleUtil from '../utils/readUtils/styleUtil.js';
import EventBus from '../../common/EventBus';
import BookNoteUtil from '../utils/fileUtils/bookNoteUtil.js';
const { ipcRenderer } = window.require('electron');

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

const getLang = el => {
    const lang = el.lang || el?.getAttributeNS?.('http://www.w3.org/XML/1998/namespace', 'lang');
    if (lang) return lang;
    if (el.parentElement) return getLang(el.parentElement);
};

const pointIsInView = ({ x, y }) =>
    x > 0 && y > 0 && x < window.innerWidth && y < window.innerHeight;

const frameRect = (frame, rect, sx = 1, sy = 1) => {
    const left = sx * rect.left + frame.left;
    const right = sx * rect.right + frame.left;
    const top = sy * rect.top + frame.top;
    const bottom = sy * rect.bottom + frame.top;
    return { left, right, top, bottom };
};

const getPosition = target => {
    const frameElement = (target.getRootNode?.() ?? target?.endContainer?.getRootNode?.())
        ?.defaultView?.frameElement;

    const transform = frameElement ? getComputedStyle(frameElement).transform : '';
    const match = transform.match(/matrix\((.+)\)/);
    const [sx, , , sy] = match?.[1]?.split(/\s*,\s*/)?.map(x => parseFloat(x)) ?? [];

    const frame = frameElement?.getBoundingClientRect() ?? { top: 0, left: 0 };
    const rects = Array.from(target.getClientRects());
    const first = frameRect(frame, rects[0], sx, sy);
    const last = frameRect(frame, rects.at(-1), sx, sy);
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const start = {
        point: { x: ((first.left + first.right) / 2) / screenWidth, y: first.top / screenHeight },
        dir: 'up',
    };
    const end = {
        point: { x: ((last.left + last.right) / 2) / screenWidth, y: last.bottom / screenHeight },
        dir: 'down',
    };
    const startInView = pointIsInView(start.point);
    const endInView = pointIsInView(end.point);
    if (!startInView && !endInView) return { point: { x: 0, y: 0 } };
    if (!startInView) return end;
    if (!endInView) return start;
    return start.point.y * screenHeight > window.innerHeight - end.point.y * screenHeight ? start : end;
};

const getSelectionRange = sel => {
    if (!sel || !sel.rangeCount) return;
    const range = sel?.getRangeAt(0);
    if (range.collapsed) return;
    return range;
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

const footnoteDialog = document.getElementById('footnote-dialog')

const onSelectionEnd = (selection) => {
    EventBus.emit('commonCtxMenu-show', selection);
}

const commonCtxMenuHide = () => {
    EventBus.emit('commonCtxMenu-hide');
}

const onAnnotationClick = (note) => {
    EventBus.emit('showNote', note);
}

const notesRefresh = (bookId) => {
    return new Promise((resolve, reject) => {
        ipcRenderer.once('db-get-all-notes-response', (event, res) => {
            if (res.success) {
                console.log('db-get-all-notes-response', res.data);
                resolve(res.data);  // 确保返回数据
            } else {
                reject(new Error('获取笔记失败'));
            }
        });
        ipcRenderer.send('db-get-notes', bookId);
    });
};


class Reader {
    bookId
    #tocView
    bookStyle
    annotations = new Map()
    annotationsByValue = new Map()
    #footnoteHandler = new FootnoteHandler()
    bookmarks
    // closeSideBar() {
    //     $('#dimming-overlay').classList.remove('show')
    //     $('#bottom-bar').classList.remove('show')
    // }
    constructor() {
        //$('#dimming-overlay').addEventListener('click', () => this.closeSideBar())
    }
    async open(file, bookId, cfi) {
        this.bookId = bookId
        this.view = document.createElement('foliate-view')
        document.body.append(this.view)
        await this.view.open(file)
        this.view.addEventListener('load', this.#onLoad.bind(this))
        this.view.addEventListener('relocate', this.#onRelocate.bind(this))
        this.view.addEventListener('click-view', this.#onClickView.bind(this))
        const { book } = this.view
        this.view.renderer.setStyles?.(getCSS(style))
        if (!cfi) this.view.renderer.next()
        this.setView(this.view)
        await this.view.init({ lastLocation: cfi })

        //$('#header-bar').style.visibility = 'visible'
        const slider = $('#progress-slider')
        slider.dir = book.dir
        slider.addEventListener('input', e =>
            this.view.goToFraction(parseFloat(e.target.value)))
        for (const fraction of this.view.getSectionFractions()) {
            const option = document.createElement('option')
            option.value = fraction
            $('#tick-marks').append(option)
        }
        document.addEventListener('keydown', this.#handleKeydown.bind(this))
        const title = formatLanguageMap(book.metadata?.title) || 'Untitled Book'
        document.title = title
        $('#side-bar-title').innerText = title
        $('#side-bar-author').innerText = formatContributor(book.metadata?.author)
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
    }

    setView(view) {
        view.addEventListener('create-overlay', e => {
            const { index } = e.detail
            //获取当前书籍的注释
            const list = this.annotations.get(index)
            if (list) for (const annotation of list)
                this.view.addAnnotation(annotation)
        })
        view.addEventListener('draw-annotation', e => {
            const { draw, annotation } = e.detail
            const { color, type } = annotation
            //draw(type, { color })
            if (type === 'highlight') draw(Overlayer.highlight, { color })
            else if (type === 'underline') draw(Overlayer.underline, { color })
            else if (type === 'squiggly') draw(Overlayer.squiggly, { color })
        })
        view.addEventListener('show-annotation', e => {
            console.log("show-annotation")
            const annotation = this.annotationsByValue.get(e.detail.value)
            const pos = getPosition(e.detail.range)
            onAnnotationClick({ annotation, pos })
        })
    }

    async renderAnnotation() {
        try {
            // 直接调用 notesRefresh 并等待结果
            this.bookmarks = await notesRefresh(this.bookId);
            if (Array.isArray(this.bookmarks)) {
                for (const bookmark of this.bookmarks) {
                    const { cfi: value, type, color, note } = bookmark;
                    const annotation = {
                        value,
                        type,
                        color,
                        note
                    };
                    this.addAnnotation(annotation);
                }
            } else {
                console.error('notesRefresh 返回的结果不是数组:', this.bookmarks);
            }
        } catch (error) {
            console.error('获取 notes 出错:', error);
        }
    }
    addAnnotation(annotation) {
        const { value } = annotation
        const spineCode = (value.split('/')[2].split('!')[0] - 2) / 2
        const list = this.annotations.get(spineCode)
        if (list) list.push(annotation)
        else this.annotations.set(spineCode, [annotation])
        this.annotationsByValue.set(value, annotation)
        this.view.addAnnotation(annotation)
    }
    removeAnnotation(cfi) {
        const annotation = this.annotationsByValue.get(cfi)
        const { value } = annotation
        const spineCode = (value.split('/')[2].split('!')[0] - 2) / 2

        const list = this.annotations.get(spineCode)
        if (list) {
            const index = list.findIndex(a => a.id === annotation.id)
            if (index !== -1) list.splice(index, 1)
        }
        this.annotationsByValue.delete(value)
        this.view.addAnnotation(annotation, true)
    }

    #onClickView({ detail: { cx, cy } }) {
        const action = partAction[clickPart(cx, cy)]
        if ($('#popup') && $('#popup').style.display !== 'none') {
            commonCtxMenuHide();
        } else {
            if (action === "prev") {
                this.view.goLeft()
            } else if (action === "next") {
                this.view.goRight()
            } else if (action === "menu") {
                // $('#dimming-overlay').classList.add('show')
                // $('#bottom-bar').classList.add('show')
                // $('.LeftBar').classList.add('show')
            }
        }
    }
    //键盘处理 
    #handleKeydown(event) {
        const k = event.key
        if (k === 'ArrowLeft' || k === 'h') this.view.goLeft()
        else if (k === 'ArrowRight' || k === 'l') this.view.goRight()
    }

    #onLoad(e) {
        const { doc, index } = e.detail
        doc.addEventListener('pointerup', () => {
            const sel = doc.getSelection()
            const range = getSelectionRange(sel)
            if (!range) return
            doc.addEventListener('click', e => e.stopPropagation(), { capture: true, once: true })
            const pos = getPosition(range)
            const cfi = this.view.getCFI(index, range);
            const lang = getLang(range.commonAncestorContainer)
            const text = sel.toString()
            onSelectionEnd({ index, range, lang, cfi, pos, text })
        })
    }
    //
    #onRelocate({ detail }) {
        const { cfi, fraction, location, tocItem, pageItem, chapterLocation } = detail
        const percent = percentFormat.format(fraction)
        const loc = pageItem
            ? `Page ${pageItem.label}`
            : `Loc ${location.current}`
        const slider = $('#progress-slider')
        // slider.style.visibility = 'visible'
        slider.value = fraction
        slider.title = `${percent} · ${loc}`
        if (tocItem?.label) $('.chapter-title').innerText = tocItem?.label
        if (tocItem?.href) this.#tocView?.setCurrentHref?.(tocItem.href)
        //保存到当前阅读记录到localstorage中
        EventBus.emit('updateBook', { id: this.bookId, currentChapter: tocItem?.label, readingPercentage: percent, lastReadPosition: cfi });
        // RecordLocation.recordHtmlLocation(this.bookKey, tocItem?.label, percent, cfi)
    }
}

export const open = async (file, bookId, cfi, bookStyle) => {
    //初始化样式
    style = bookStyle || {
        fontSize: 1.0, lineHeight: 1.8, letterSpacing: 2.0, wordSpacing: 2.0,
        paragraphSpacing: 1.0, textIndent: 0, justify: true, hyphenate: true,
    };
    const reader = new Reader();
    globalThis.reader = reader;
    await reader.open(file, bookId, cfi);
    reader.renderAnnotation();
}

export const setStyle = (newStyle) => {
    style = {
        ...style,
        ...newStyle
    }
    reader.view.renderer.setStyles?.(getCSS(style));
    StyleUtil.setStyle(style);
}


export const noteRefresh = async () => {
    await reader.renderAnnotation();
}

export const removeNote = (cfi) => {
    reader.removeAnnotation(cfi)
}

export const addAnnotation = (note) => {
    const annotation = {
        value: note.cfi,
        type: note.type,
        color: note.color,
        note: note.note
    };
    reader.addAnnotation(annotation);
}








