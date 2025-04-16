const Epub = require('epub-gen');
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

/**
 * 
 * @param {*} txtFilePath TXT 文件路径
 * @param {*} epubFilePath 生成epub 文件路径
 */
const convertTxtToEpub = (txtFilePath, epubFilePath) => {
    return new Promise(async (resolve, reject) => {
        try {
            const encoding = await detectEncoding(txtFilePath); // 自动检测编码
            console.log(`检测到文件编码为: ${encoding}`);
            const content = await readTxtFile(txtFilePath, encoding);
            await processContent(content);
            resolve(epubFilePath);

            async function processContent(content) {
                const numberPattern = `[零一二三四五六七八九十百千万0-9]+`;
                // 提取可匹配的字符串到数组
                const commonPrefixes = ['第', '卷', 'chapter'];
                // 处理前缀，让其前面允许有空格
                const prefixedPrefixes = commonPrefixes.map(prefix => `\\s*${prefix}`);
                const commonSuffixes = ["章", "节", "回", "節", "卷", "部", "輯", "辑", "話", "集", "话", "篇", " ", "　"];
                const specialTitles = ["序章", "前言", "声明", "写在前面的话", "后记", "楔子", "后序"];

                // 动态生成正则表达式
                const prefixPattern = prefixedPrefixes.join('|');
                const suffixPattern = commonSuffixes.join('|');
                const specialPattern = specialTitles.join('|');

                const chapterRegex = new RegExp(`^(?:${prefixPattern}).*(?:${suffixPattern}).*$|^(?:${specialPattern})$`, 'gm');

                const chapters = [];
                let lastIndex = 0;

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
                let match;
                while ((match = chapterRegex.exec(content)) !== null) {
                    if (chapters.length > 0) {
                        const prevChapterEnd = match.index;
                        let chapterContent = content.slice(lastIndex, prevChapterEnd);
                        chapterContent = formatText(chapterContent);
                        chapters[chapters.length - 1].data += chapterContent;
                    }

                    // 去除 match[0] 前面的空格
                    const trimmedTitle = match[0].trim();
                    chapters.push({
                        title: trimmedTitle,
                        data: ''
                    });
                    lastIndex = match.index + match[0].length;
                }

                if (chapters.length > 0) {
                    let lastChapterContent = content.slice(lastIndex);
                    lastChapterContent = formatText(lastChapterContent);
                    chapters[chapters.length - 1].data += lastChapterContent;
                } else {
                    const formattedContent = formatText(content);
                    // 修改此处标题为中文
                    chapters.push({
                        title: fileName,
                        data: formattedContent
                    });
                }

                const options = {
                    title: title,
                    author: author,
                    content: chapters,
                    tocTitle: '主目录'
                };

                try {
                    // ...已有代码...
                    console.log('开始转换 TXT 文件为 EPUB 文件');
                    await new Epub(options, epubFilePath).promise;
                    console.log('EPUB 文件生成成功');
                } catch (err) {
                    console.error('转换过程中出现错误:', err);
                    throw err;
                }

            }
        } catch (err) {
            console.error('转换过程中出错:', err);
            reject(err);
        }
    });
}

// 导出
module.exports = {
    convertTxtToEpub
}