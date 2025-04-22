const JSZip = require('jszip');
const createEpub = async (chapters, metadata) => {
    return new Promise((resolve, reject) => {
        try {
            const { author, title } = metadata;
            console.log(`Author: ${author}`, `Title: ${title}`);

            const zip = new JSZip();
            zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
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
    `).join("").trim();
            let spine = chapters.map((_, index) => `
        <itemref idref="chap${index + 1}"/>`
            ).join("").trim();
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

            zip.generateAsync({ type: 'nodebuffer' }).then((epubContent) => {
                resolve(epubContent);
            }).catch((err) => {
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
    createEpub
};