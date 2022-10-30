const express = require('express');
const path = require('path');
const catboys = require('catboys');
const nekos = require('nekos.life');

const app = express();
const neko = new nekos();
const catboy = new catboys();

const port = process.env.PORT || 5000;

let count = 0;
let response = undefined;
let coolResponse = undefined;

async function processImage(blob) {
    return await blob.arrayBuffer().then((arrayBuffer) => Buffer.from(arrayBuffer, 'binary'));
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/nsfw', async (req, res) => {
    res.redirect(301, '/');
});
app.get('/nsfw/:category', async (req, res) => {
    const { category } = req.params;

    if (!['waifu', 'neko', 'trap', 'blowjob'].includes(category)) {
        res.redirect(301, '/');
    }

    try {
        response = await (await fetch(`https://api.waifu.pics/nsfw/${category}`)).json();
    } catch {
        res.status(500).send({ message: 'Fail requesting image' });
    }

    try {
        coolResponse = await fetch(response.url);
    } catch {
        res.status(500).send({ message: 'Fail fetching image' });
    }

    (category === 'blowjob') ? res.contentType('image/gif') : res.contentType('image/png');
    res.end(await processImage(await coolResponse.blob()));
});

app.get('/catboy', async (req, res) => {
    try {
        response = await fetch((await catboy.image()).url);
    } catch {
        res.status(500).send({ message: 'Fail fetching image' });
    }

    res.contentType('image/png');
    res.end(await processImage(await response.blob()));
});

app.get('/neko', async (req, res) => {
    try {
        response = await fetch((await neko.neko()).url);
    } catch {
        res.status(500).res({ message: 'Fail fetching image' });
    }

    res.contentType('image/png');
    res.end(await processImage(await response.blob()));
});

app.get('/loli', async (req, res) => {
    const value = Math.floor(Math.random() * 101);

    try {
        response = await (await fetch(`https://lolibooru.moe/post/index.json?tags=nude&limit=${value}`)).json();
    } catch {
        res.status(500).send({ message: 'Fail requesting image' });
    }

    try {
        coolResponse = await fetch(response[value - 1].file_url);
    } catch {
        res.status(500).send({ message: 'Fail fetching image' });
    }

    res.contentType('image/png');
    res.end(await processImage(await coolResponse.blob()));
});

app.get('/count', async (req, res) => {
    res.json({ count });
});

app.post('/count', async (req, res) => {
    ++count;
    res.json({ count });
});

app.listen(port, () => {
    console.log(`Listening in http://localhost:${port}`);
});