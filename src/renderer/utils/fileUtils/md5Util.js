import SparkMD5 from "spark-md5";

export const fetchMD5 = (file) => {
    return new Promise(async (resolve, reject) => {
        try {
            let md5 = await getFileMD5(file);
            resolve(md5);
        } catch (error) {
            reject("fetchMD5");
        }
    });
};
export const getFileMD5 = (file) => {
    return new Promise((resolve, reject) => {
        try {
            var blobSlice =
                (File).prototype.slice ||
                (File).prototype.mozSlice ||
                (File).prototype.webkitSlice,
                chunkSize = 2097152,
                chunks = Math.ceil(file.size / chunkSize),
                currentChunk = 0,
                spark = new SparkMD5(),
                fileReader = new FileReader();
            fileReader.onload = async (e) => {
                if (!e.target) {
                    reject("");
                    throw new Error();
                }
                spark.appendBinary(e.target.result); // append array buffer
                currentChunk += 1;
                if (currentChunk < chunks) {
                    loadNext();
                } else {
                    resolve(spark.end());
                }
            };

            const loadNext = () => {
                var start = currentChunk * chunkSize,
                    end = start + chunkSize >= file.size ? file.size : start + chunkSize;

                fileReader.readAsBinaryString(blobSlice.call(file, start, end));
            };

            loadNext();
        } catch (error) {
            reject("getFileMD5");
        }
    });
};
