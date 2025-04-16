const JSZip = require('jszip');
const fs = require('fs/promises');
const path = require('path');
const iconv = require('iconv-lite');
const chardet = require('chardet');

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

/**
 * 使用 JSZip 将 TXT 文件转换为 EPUB 文件。
 * @param {string} txtFilePath - 输入 TXT 文件的路径。
 * @param {string} epubFilePath - 输出 EPUB 文件的路径。
 * @returns {Promise<void>} 一个 Promise，在转换完成时解析。
 */
const convertTxtToEpub = async (txtFilePath, epubFilePath) => {
    try {
        // 检测文件编码
        const encoding = await detectEncoding(txtFilePath);
        console.log(`检测到文件编码为: ${encoding}`);
        // 读取 TXT 文件内容
        const txtContent = await readTxtFile(txtFilePath, encoding);

        const zip = new JSZip();
        zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

        const metaInf = zip.folder('META-INF');
        metaInf.file('container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`);

        const oebps = zip.folder('OEBPS');
        const bookTitle = path.basename(txtFilePath, '.txt');
        const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:title>${bookTitle}</dc:title>
        <dc:language>zh</dc:language>
        <dc:identifier id="book-id">urn:uuid:${uuidv4()}</dc:identifier>
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        <item id="html" href="content.xhtml" media-type="application/xhtml+xml"/>
    </manifest>
    <spine toc="ncx">
        <itemref idref="html"/>
    </spine>
</package>`;
        oebps.file('content.opf', contentOpf);

        const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2.0">
    <head>
        <meta name="dtb:uid" content="urn:uuid:${uuidv4()}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>${bookTitle}</text>
    </docTitle>
    <navMap>
        <navPoint id="navpoint-1" playOrder="1">
            <navLabel>
                <text>${bookTitle}</text>
            </navLabel>
            <content src="content.xhtml"/>
        </navPoint>
    </navMap>
</ncx>`;
        oebps.file('toc.ncx', tocNcx);

        const formattedContent = `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>${bookTitle}</title>
</head>
<body>
    <h1>${bookTitle}</h1>
    <p>${txtContent.replace(/\n/g, '</p><p>')}</p>
</body>
</html>`;
        oebps.file('content.xhtml', formattedContent);

        const epubContent = await zip.generateAsync({ type: 'nodebuffer' });
        await fs.writeFile(epubFilePath, epubContent);

        console.log('EPUB 文件生成成功');
    } catch (err) {
        console.error('转换过程中出现错误:', err);
        throw err;
    }
};

// 辅助函数，用于生成 UUID
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = {
    convertTxtToEpub
};