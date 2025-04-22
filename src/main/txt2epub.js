const { createEpub } = require('./createEpub');
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
const convertTxtToEpub = (txtFilePath, epubFilePath) => {
    return new Promise((resolve, reject) => {
        try {
            const { author, title } = setEpubInfo(txtFilePath);
            console.log(`Author: ${author}`, `Title: ${title}`);
            // 检测文件编码
            detectEncoding(txtFilePath)
                .then((encoding) => {
                    console.log(`检测到文件编码为: ${encoding}`);
                    // 读取 TXT 文件内容
                    return readTxtFile(txtFilePath, encoding);
                })
                .then((txtContent) => {
                    const chapters = getChapters(txtContent, title);
                    console.log(chapters);
                    // 创建 EPUB 文件
                    return createEpub(chapters, { author, title });
                })
                .then((epubContent) => {
                    // 将 EPUB 文件写入磁盘
                    return fs.writeFile(epubFilePath, epubContent);
                })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    console.error('转换过程中出现错误:', err);
                    reject(err);
                });
        } catch (err) {
            console.error('转换过程中出现错误:', err);
            reject(err);
        }
    });
};

module.exports = {
    convertTxtToEpub
};