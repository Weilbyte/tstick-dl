const axios = require('axios');
const fs = require('fs');
const archiver = require('archiver');
const os = require('os');
const path = require('path');

exports.getStickerPack = async function (name) {
    try {
        const result = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getStickerSet?name=${name}`);
        return ['OK', result.data]
    } catch(e) {
        if (e.response.status == 400) {
            return ['INVALID', null]
        } else {
            return ['UNHANDLED', null]
        }
    }
};

exports.downloadStickerPack = async function (packInfo) {
    const packName = packInfo.result.name;
    const packFolder = path.join(os.tmpdir(), 'tstickdl', packName);
    if (fs.existsSync(packFolder)) return;

    console.log(`[${packName}] Download :: Start`);
    fs.mkdirSync(packFolder, { recursive: true });

    for (const sticker in packInfo.result.stickers) {
        await downloadSticker(path.join(os.tmpdir(), 'tstickdl', packName), packInfo.result.stickers[sticker].file_id);
        await new Promise(r => setTimeout(r, 5))
    };
    console.log(`[${packName}] Download :: Finish`)
};

async function downloadSticker(outputFolder, fileID) {
    try {
        const result = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileID}`);
        
        const writer = fs.createWriteStream(path.join(outputFolder, result.data.result.file_path.substring(9)))
        const resourcePath = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${result.data.result.file_path}`;
        const resourceResult = await axios({
            url: resourcePath,
            method: 'GET',
            responseType: 'stream'
        });
        resourceResult.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch(e) {
        console.log('Error while downloading file: ', e);
    }
};

exports.packageStickerPack = async function (packInfo) {
    try {
        const packName = packInfo.result.name;
        const outFile = path.join(os.tmpdir(), 'tstickdl', `${packName}.zip`)
        if (fs.existsSync(outFile)) return outFile;

        console.log(`[${packName}] Archive :: Start`);

        const writer = fs.createWriteStream(outFile);
        var archive = archiver('zip');

        archive.on('error', (err) => { throw err });

        archive.pipe(writer);
        archive.directory(path.join(os.tmpdir(), 'tstickdl', packName), false);

        archive.finalize();

        return new Promise((resolve, reject) => {
            writer.on('close', () => {
                console.log(`[${packName}] Archive :: Finish`);
                resolve(outFile);
            });
            writer.on('error', reject);
        });
    } catch(e) {
        console.log('Error while packaging sticker pack: ', e);
    };
};