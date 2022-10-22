const express = require('express');
const path = require('path');
const catboys = require('catboys');
const nekos = require('nekos.life');

const catboy = new catboys();
const neko = new nekos();
const app = express();

const port = process.env.PORT || 5000;

let count = 0;

async function processImage(blob) {
    return await (await blob).arrayBuffer().then((arrayBuffer) => Buffer.from(arrayBuffer, 'binary'));
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
})

app.get('/nsfw', async (req, res) => {
    if (req.query.category == 'waifu', 'neko', 'trap', 'blowjob') {
        const coolResponse = await fetch(`https://api.waifu.pics/nsfw/${req.query.category}`);
        const data = await coolResponse.json();
        if (coolResponse.status != 200) {
            res.status(500).json({'detail': 'Fail requesting image'});
        } else {
            const coolResponse = await fetch(data.url);
            if (coolResponse.status != 200) {
                res.status(500).json({'details': 'Fail fetching image'});
            } else {
                (req.query.category == 'blowjob') ? res.contentType('image/gif') : res.contentType('image/png');
                res.end(await processImage(await coolResponse.blob()));
            };
        };
    } else {
        res.redirect(301, 'back');
    };
});

app.get('/catboy', async (req, res) => {
    const coolResponse = await fetch((await catboy.image()).url);

    if (coolResponse.status != 200) {
        res.status(500).json({'details': 'Fail fetching image'});
    } else {
        res.contentType('image/png');
        res.end(await processImage(await coolResponse.blob()));
    }
});

app.get('/neko', async (req, res) => {
    const coolResponse = await fetch(((await neko.neko()).url));

    if (coolResponse.status != 200) {
        res.status(500).json({'details': 'Fail fetching image'});
    } else {
        res.contentType('image/png');
        res.end(await processImage(await coolResponse.blob()))
    }
});

app.get('/count', (req, res) => {
    res.json({count});
});

app.post('/count', (req, res) => {
    ++count;
    res.json({count});
})

app.listen(port, () => {
    console.log(`We are online baby: http://localhost:${port}`);
});

// Vercel thing
module.exports = app;