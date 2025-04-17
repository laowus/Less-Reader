const JSZip = require('jszip');
const fs = require('fs/promises');
const iconv = require('iconv-lite');
const chardet = require('chardet');
const path = require('path');

// 读取 TXT 文件内容，支持指定编码
const readTxtFile = async (filePath, encoding = 'utf8') => {
    try {
        const buffer = await fs.readFile(filePath);
        return iconv.decode(buffer, encoding);
    } catch (err) {
        throw new Error(`读取文件 ${filePath} 时出错: ${err.message}`);
    }
}

// 检测文件编码
const detectEncoding = async (filePath) => {
    const buffer = await fs.readFile(filePath);
    const detectedEncoding = chardet.detect(buffer);
    return detectedEncoding || 'utf8';
}
const setEpubInfo = (txtFilePath) => {
    //获取作品名字和作者信息
    const fileName = path.basename(txtFilePath, '.txt');
    // 按第一个空格或者 - 分割文件名
    const splitRegex = /[ -]/;
    const parts = fileName.split(splitRegex, 2);
    let author = 'Unknown';
    let title = fileName;
    if (parts.length === 2) {
        author = parts[0];
        title = parts[1];
    }
    return { author, title };
}

// 格式化文本，添加分段和缩进
const formatText = (text) => {
    const lines = text.split('\n');
    let paragraphs = [];

    for (let line of lines) {
        line = line.trim();
        if (line !== '') {
            paragraphs.push(`<p>${line}</p>`);
        }
    }

    return paragraphs.join('\n');
}

const getChapters = (content, title) => {
    const chapterRegex = /^\s*([第卷][一二三四五六七八九十0-9]+[章卷节辑话篇]).*|^\s*(楔子|引言|序章|声明|后记|后序|前言)(?::[^\n]*)?$/gm;
    const chapters = [];
    let lastIndex = 0;
    let match;
    while ((match = chapterRegex.exec(content)) !== null) {
        if (chapters.length > 0) {
            const prevChapterEnd = match.index;
            let chapterContent = content.slice(lastIndex, prevChapterEnd);
            chapterContent = formatText(chapterContent);
            // 若 chapterContent 为空，则跳过本次循环
            if (chapterContent === '') {
                chapters.pop();
                continue;
            }
            chapters[chapters.length - 1].content += chapterContent;
        }

        const trimmedTitle = match[0].trim();
        chapters.push({
            title: trimmedTitle,
            content: ''
        });
        lastIndex = match.index + match[0].length;
    }
    if (chapters.length > 0) {
        let lastChapterContent = content.slice(lastIndex);
        lastChapterContent = formatText(lastChapterContent);
        chapters[chapters.length - 1].content += lastChapterContent;
    } else {
        //无法分割，就全部生成一个html文件
        const formattedContent = formatText(content);
        chapters.push({
            title: title,
            content: formattedContent
        });
    }
    return chapters;
}

/**
 * 使用 JSZip 将 TXT 文件转换为 EPUB 文件。
 * @param {string} txtFilePath - 输入 TXT 文件的路径。
 * @param {string} epubFilePath - 输出 EPUB 文件的路径。
 * @returns {Promise<void>} 一个 Promise，在转换完成时解析。
 */
const convertTxtToEpub = async (txtFilePath, epubFilePath) => {
    try {
        const { author, title } = setEpubInfo(txtFilePath);
        console.log(`Author: ${author}`, `Title: ${title}`);
        // 检测文件编码
        const encoding = await detectEncoding(txtFilePath);
        console.log(`检测到文件编码为: ${encoding}`);
        // 读取 TXT 文件内容
        const txtContent = await readTxtFile(txtFilePath, encoding);
        const chapters = getChapters(txtContent, title);
        console.log(chapters);

        // Initialize JSZip
        const zip = new JSZip();
        // Add mimetype file
        zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

        // Add META-INF/container.xml
        zip.folder("META-INF").file("container.xml", `
            <?xml version="1.0" encoding="UTF-8"?>
            <container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
                <rootfiles>
                <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
                </rootfiles>
            </container>`.trim());
        const navPoints = chapters.map(
            (chapter, index) => {
                const id = `chapter${index + 1}`;
                const playOrder = index + 2; // 封页的 playOrder 为 1
                return (`
                <navPoint id="navPoint-${id}" playOrder="${playOrder}">
                  <navLabel>
                    <text>${chapter.title}</text>
                  </navLabel>
                  <content src="./OEBPS/${id}.xhtml" />
                </navPoint>
              `).trim();
            }).join("\n");

        //目录页面
        zip.folder("").file("toc.ncx", `
            <?xml version="1.0" encoding="UTF-8"?>
            <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
                <head>
                <meta name="dtb:uid" content="book-id" />
                <meta name="dtb:depth" content="1" />
                <meta name="dtb:totalPageCount" content="0" />
                <meta name="dtb:maxPageNumber" content="0" />
                </head>
                <docTitle>
                <text>${title}</text>
                </docTitle>
                <docAuthor>
                <text>${author}</text>
                </docAuthor>
                <navMap>
                ${navPoints}
                </navMap>
            </ncx>`.trim());
        // Add OEBPS/content.opf
        const manifest = chapters.map((_, index) => `
        <item id="chap${index + 1}" href="OEBPS/chapter${index + 1}.xhtml" media-type="application/xhtml+xml"/>
    `).join("\n").trim();
        let spine = chapters.map((_, index) => `
        <itemref idref="chap${index + 1}"/>`
        ).join("\n").trim();
        //生成内容页面
        chapters.forEach((chapter, index) => {
            zip.folder("OEBPS").file(`chapter${index + 1}.xhtml`, `
                <?xml version="1.0" encoding="UTF-8"?>
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml" lang="zh">
                  <head>
                    <title>${chapter.title}</title>
                    <link rel="stylesheet" type="text/css" href="../style.css"/>
                  </head>
                  <body>
                  <h1>${chapter.title}</h1>
                  ${chapter.content}
                  </body>
                </html>
              `.trim());
        });
        const tocManifest = `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`;
        zip.folder("").file("content.opf", `
            <?xml version="1.0" encoding="UTF-8"?>
            <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id" version="2.0">
              <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
                <dc:title>${title}</dc:title>
                <dc:language>zh</dc:language>
                <dc:creator>${author}</dc:creator>
                <dc:identifier id="book-id">${new Date().getTime()}</dc:identifier>
              </metadata>
              <manifest>
                ${manifest}
                ${tocManifest}
              </manifest>
              <spine toc="ncx">
                ${spine}
              </spine>
            </package>
          `.trim());

        const epubContent = await zip.generateAsync({ type: 'nodebuffer' });
        await fs.writeFile(epubFilePath, epubContent);

        console.log('EPUB 文件生成成功');
    } catch (err) {
        console.error('转换过程中出现错误:', err);
        throw err;
    }
};


module.exports = {
    convertTxtToEpub
};