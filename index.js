const url = require('url');

const {getStickerPack, downloadStickerPack, packageStickerPack} = require('./sticker');

exports.entry = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (!process.env.TELEGRAM_BOT_TOKEN) {
        return res.status(400).send(JSON.stringify({
            success: false,
            msg: 'Microservice not configured properly (missing \'TELEGRAM_BOT_TOKEN\' env variable).'
        }));
    };

    const param = url.parse(req.url,true).query;

    if ('name' in param) {
        const stickers = await getStickerPack(param.name)
        if (stickers[0] == 'OK') {
            await downloadStickerPack(stickers[1]);
            const packagedPath = await packageStickerPack(stickers[1]);
            console.log(`[${param.name}] Serve`)
            return res.download(packagedPath);
        } else if (stickers[0] == 'INVALID') {
            return res.status(400).send(JSON.stringify({
                success: false,
                msg: 'The provided sticker pack name is not valid.'
            }));
        } else {
            return res.status(500).send(JSON.stringify({
                success: false,
                msg: 'Unhandled error while retrieving sticker pack information.'
            }));
        };
    } else {
        return res.status(400).send(JSON.stringify({
            success: false,
            msg: 'Missing parameter \'name\' which represents the name of the sticker pack.'
        }));
    };
  };