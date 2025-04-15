// 使用 CommonJS 模块导入
const Epub = require('epub-gen');
const fs = require('fs/promises');
const path = require('path');
const iconv = require('iconv-lite');

// 读取 TXT 文件内容，支持指定编码
async function readTxtFile(filePath, encoding = 'utf8') {
    try {
        const buffer = await fs.readFile(filePath);
        return iconv.decode(buffer, encoding);
    } catch (err) {
        throw new Error(`读取文件 ${filePath} 时出错: ${err.message}`);
    }
}

// 检测文件的主要语言
function detectLanguage(text) {
    let chineseCount = 0;
    let englishCount = 0;

    for (let char of text) {
        const code = char.charCodeAt(0);
        // 检测中文字符
        if (code >= 0x4e00 && code <= 0x9fa5) {
            chineseCount++;
        }
        // 检测英文字符（大小写字母）
        else if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)) {
            englishCount++;
        }
    }

    const totalCount = chineseCount + englishCount;
    if (totalCount === 0) {
        return 'unknown';
    }

    const chineseRatio = chineseCount / totalCount;
    const englishRatio = englishCount / totalCount;

    if (chineseRatio > englishRatio) {
        return 'chinese';
    } else if (englishRatio > chineseRatio) {
        return 'english';
    } else {
        return 'unknown';
    }
}

// 格式化文本，添加分段和缩进
function formatText(text) {
    const lines = text.split('\n');
    let paragraphs = [];

    for (let line of lines) {
        line = line.trim();
        if (line !== '') {
            paragraphs.push(`<p>&emsp;&emsp;${line}</p>`);
        }
    }

    return paragraphs.join('\n');
}

// 转换 TXT 文件为 EPUB 文件
async function convertTxtToEpub(txtFilePath, epubFilePath, encoding = null) {
    try {
        const content = await readTxtFile(txtFilePath, encoding || 'utf8');
        const language = detectLanguage(content);
        console.log(`检测到文件主要语言为: ${language}`);

        // 根据语言设置编码
        if (!encoding) {
            if (language === 'chinese') {
                encoding = 'gbk';
            } else {
                encoding = 'utf8';
            }
            // 重新读取文件，使用新的编码
            const reReadContent = await readTxtFile(txtFilePath, encoding);
            // 后续处理使用重新读取的内容
            processContent(reReadContent);
        } else {
            processContent(content);
        }

        async function processContent(content) {
            // 提取可匹配的字符串到数组
            const commonPrefixes = ['第', '卷', 'chapter'];
            const commonSuffixes = ["章", "节", "回", "節", "卷", "部", "輯", "辑", "話", "集", "话", "篇", " ", "　"];
            const specialTitles = ["序章", "前言", "声明", "写在前面的话", "后记", "楔子", "后序"];

            // 动态生成正则表达式
            const prefixPattern = commonPrefixes.join('|');
            const suffixPattern = commonSuffixes.join('|');
            const specialPattern = specialTitles.join('|');

            const chapterRegex = new RegExp(`^(?:${prefixPattern}).*(?:${suffixPattern}).*$|^(?:${specialPattern})$`, 'gm');

            const chapters = [];
            let lastIndex = 0;

            let match;
            while ((match = chapterRegex.exec(content)) !== null) {
                if (chapters.length > 0) {
                    const prevChapterEnd = match.index;
                    let chapterContent = content.slice(lastIndex, prevChapterEnd);
                    chapterContent = formatText(chapterContent);
                    chapters[chapters.length - 1].data += chapterContent;
                }
                chapters.push({
                    title: match[0],
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
                    title: '目录',
                    data: formattedContent
                });
            }

            const options = {
                title: path.basename(txtFilePath, '.txt'),
                author: 'Unknown',
                content: chapters
            };

            await new Epub(options, epubFilePath).promise;
            console.log('EPUB 文件生成成功！');
        }
    } catch (err) {
        console.error('转换过程中出错:', err);
    }
}
// 使用示例
const txtFilePath = '秦红《傀儡侠》.txt';
const epubFilePath = '秦红《傀儡侠》.epub';
convertTxtToEpub(txtFilePath, epubFilePath);