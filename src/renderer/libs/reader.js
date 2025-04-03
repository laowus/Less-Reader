import './view.js'
import { FootnoteHandler } from './ui/footnotes.js'
import { createTOCView } from './ui/tree.js'
import { Overlayer } from './ui/overlayer.js'
import StyleUtil from '../utils/readUtils/styleUtil.js';
import EventBus from '../../common/EventBus';
const { ipcRenderer } = window.require('electron');
import Tts from '../utils/readUtils/tts.js';

/**
 * fontsize 字体大小
 * fontWeight 字体粗细
 * spacing / lineHeight 行距 
 * letterSpacing 字间距
 * textIndent 段落缩进
 * paragraphSpacing 段落间距
 * justify 是否两端对齐
 * hyphenate 是否自动连字符
 * 文字方向 writing-mode: horizontal-tb; writing-mode: vertical-rl;
 */
const getCSS = ({ fontSize, fontWeight, lineHeight, letterSpacing, wordSpacing, textIndent,
    paragraphSpacing, justify, hyphenate, writingMode, fontColor, backgroundColor, fontFamily }) => `
    @namespace epub "http://www.idpf.org/2007/ops";
    html {
        color-scheme: light dark;
        letter-spacing: ${letterSpacing}px;
        font-size: ${fontSize}px;
        writing-mode:${writingMode};
        color: ${fontColor} !important;
        background: none !important;
        background-color: ${backgroundColor} !important;
    }
    body {
        background: none !important;
        background-color: transparent;
    }
    /* https://github.com/whatwg/html/issues/5426 */
    @media (prefers-color-scheme: dark) {
        a:link {
            color: lightblue;
        }
    }

    * {
        line-height: ${lineHeight}em !important;
       font-family: ${fontFamily} !important;
    }
    p, li, blockquote, dd, div, font  {
        font-weight: ${fontWeight} !important;
        color: ${fontColor} !important;
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
        letter-spacing: ${letterSpacing}px !important;
        word-spacing:${wordSpacing}px !important;
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
    annotations = new Map()
    annotationsByValue = new Map()
    #footnoteHandler = new FootnoteHandler()
    bookmarks
    view
    bookObj
    constructor() {
    }
    //async open(file, bookId, cfi) 
    async open(bookObj) {
        this.bookId = bookObj.id
        this.bookObj = bookObj
        this.view = document.createElement('foliate-view')
        $('.foliate-viewer').append(this.view)
        //document.body.append(this.view)
        await this.view.open(bookObj.path)
        this.view.addEventListener('load', this.#onLoad.bind(this))
        this.view.addEventListener('relocate', this.#onRelocate.bind(this))
        this.view.addEventListener('click-view', this.#onClickView.bind(this))
        const { book } = this.view
        this.view.renderer.setStyles?.(getCSS(style))
        if (!bookObj.lastReadPosition) this.view.renderer.next()
        this.setView(this.view)
        await this.view.init({ lastLocation: bookObj.lastReadPosition })
        const slider = $('#progress-slider')
        slider.dir = book.dir
        slider.addEventListener('input', e =>
            this.view.goToFraction(parseFloat(e.target.value)))
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
            const chapter = doc.title;
            const sel = doc.getSelection()
            const range = getSelectionRange(sel)
            if (!range) return
            doc.addEventListener('click', e => e.stopPropagation(), { capture: true, once: true })
            const pos = getPosition(range)
            const cfi = this.view.getCFI(index, range);
            const lang = getLang(range.commonAncestorContainer)
            const text = sel.toString()
            onSelectionEnd({ index, range, lang, cfi, pos, text, chapter })
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
        const currentPercent = $('#current-percent')
        slider.value = fraction
        slider.title = `${percent} · ${loc}`
        currentPercent.innerText = percent
        if (tocItem?.label) $('.chapter-title').innerText = tocItem?.label
        else $('.chapter-title').innerText = this.bookObj.name
        if (tocItem?.href) this.#tocView?.setCurrentHref?.(tocItem.href)
        //保存到当前阅读记录到localstorage中
        EventBus.emit('updateBook', { id: this.bookId, currentChapter: tocItem?.label, readingPercentage: percent, lastReadPosition: cfi });
        this.view.renderer.updatePageNumber(style.fontColor)
        //页面更新重新读取
        if (Tts.synth?.speaking) {
            Tts.stop();
            Tts.speak();
        }
    }
}

export const open = async (bookObj, currentStyle) => {
    //初始化样式
    style = currentStyle || {
        fontSize: 14, fontWeight: 400, lineHeight: 1.7, letterSpacing: 2.0, wordSpacing: 2.5, textIndent: 2,
        paragraphSpacing: 1.0, justify: true, hyphenate: true, writingMode: "horizontal-tb",
        fontColor: '#171717', backgroundColor: '#ffffff', fontFamily: "Microsoft YaHei", btnBgColor: '#cccccc'
    };
    const reader = new Reader();
    globalThis.reader = reader;
    await reader.open(bookObj);
    reader.renderAnnotation();
}

window.setStyle = (newStyle) => {
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

window.removeNote = (cfi) => {
    reader.removeAnnotation(cfi)
}

window.addAnnotation = (note) => {
    const annotation = {
        value: note.cfi,
        type: note.type,
        color: note.color,
        note: note.note
    };
    reader.addAnnotation(annotation);
}

window.prevSection = () => reader.view.renderer.prevSection()

window.nextSection = () => reader.view.renderer.nextSection()


window.goToCfi = cfi => reader.view.goTo(cfi)

window.goToNext = (isNext) => {
    isNext ? reader.view.goRight() : reader.view.goLeft();
}

window.initTts = () => reader.view.initTTS()

window.ttsStop = () => reader.view.initTTS(true)

window.ttsHere = () => {
    initTts();
    return reader.view.tts.from(reader.view.lastLocation.range)
}
window.ttsNextSection = async () => {
    await nextSection()
    initTts()
    return ttsNext()
}

window.ttsPrevSection = async (last) => {
    await prevSection()
    initTts()
    return last ? reader.view.tts.end() : ttsNext()
}
//
window.ttsNext = async () => {
    const result = reader.view.tts.next(true)
    if (result) return result
    return await ttsNextSection()
}

window.ttsPrev = () => {
    const result = reader.view.tts.prev(true)
    if (result) return result
    return ttsPrevSection(true)
}










