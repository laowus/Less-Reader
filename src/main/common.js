const fs = require('fs');
// 封装的函数，判断文件夹是否存在，不存在则创建
const ensureDirectoryExists = (dirPath) => {
    fs.access(dirPath, fs.constants.F_OK, (err) => {
        if (err) {
            // 文件夹不存在，创建它
            fs.mkdir(dirPath, { recursive: true }, (mkdirErr) => {
                if (mkdirErr) {
                    console.error("Error creating folder:", mkdirErr);
                } else {
                    console.log("Folder created successfully:", dirPath);
                }
            });
        } else {
            // 文件夹存在
            console.log("Folder already exists:", dirPath);
        }
    });
};

module.exports = {
    ensureDirectoryExists
}