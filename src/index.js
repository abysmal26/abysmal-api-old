const express = require('express');
const path = require('path');
const catboys = require('catboys');
const nekos = require('nekos.life');
const Yiffy = require('yiffy');
const { E6 } = require('furry-wrapper');

const app = express();
const neko = new nekos();
const catboy = new catboys();
const yiff = new Yiffy();

const port = process.env.PORT || 5000;

let count = 0;
let response = undefined;
let coolResponse = undefined;

async function processImage(blob) {
    // What the fuck is this, please someone tell me there is a better way
    return await blob.arrayBuffer().then((arrayBuffer) => Buffer.from(arrayBuffer, 'binary'));
}

// This sucks, but work
async function shitFunction(category) {
    const category_list = {
        'straight': await yiff.furry.yiff.straight('json'),
        'gay': await yiff.furry.yiff.gay('json'),
        'lesbian': await yiff.furry.yiff.lesbian('json'),
        'gynomorph': await yiff.furry.yiff.gynomorph('json'),
        'andromorph': await yiff.furry.yiff.andromorph('json'),
    };

    return category_list[category];
}

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, './public/index.html')); });

app.get('/nsfw', async (req, res) => { res.redirect(301, '/'); });
app.get('/nsfw/:category', async (req, res) => {
    const { category } = req.params;

    if (!['waifu', 'neko', 'trap', 'blowjob'].includes(category)) {
        return res.redirect(301, '/');
    }

    try {
        response = await (await fetch(`https://api.waifu.pics/nsfw/${category}`)).json();
    } catch {
        return res.status(500).send({ message: 'Fail requesting image' });
    }

    try {
        coolResponse = await fetch(response.url);
    } catch {
        return res.status(500).send({ message: 'Fail fetching image' });
    }

    (category === 'blowjob') ? res.contentType('image/gif') : res.contentType('image/png');
    res.end(await processImage(await coolResponse.blob()));
});

app.get('/yiff', async (req, res) => { res.redirect(301, '/'); });
app.get('/yiff/:category', async (req, res) => {
    const { category } = req.params;

    // It takes a little performance, but fuck it
    if (!['straight', 'gay', 'lesbian', 'gynomorph', 'andromorph'].includes(category)) {
        return res.redirect(301, '/');
    }

    try {
        response = await shitFunction(category);
    } catch {
        return res.status(500).send({ message: 'Fail requesting image' });
    }

    try {
        coolResponse = await fetch(response[0].url);
    } catch {
        return res.status(500).send({ message: 'Fail fetching image' });
    }

    res.contentType('image/png');
    res.end(await processImage(await coolResponse.blob()));
});

app.get('/yiff2', async (req, res) => { res.redirect(301, '/'); });
app.get('/yiff2/:tags', async (req, res) => {
    const { tags } = req.params;

    // Try to request
    // Why try? because the user can put a screwed up tag and fuck it all up
    try {
        response = (await E6.nsfw(tags)).file.url;
    } catch {
        return res.status(500).send({ message: 'Fail requesting image' });
    }

    try {
        coolResponse = await fetch(response);
    } catch {
        return res.status(500).send({ message: 'Fail fetching image' });
    }

    res.contentType('image/png');
    res.end(await processImage(await coolResponse.blob()));
});

app.get('/catboy', async (req, res) => {
    try {
        response = await fetch((await catboy.image()).url);
    } catch {
        return res.status(500).send({ message: 'Fail fetching image' });
    }

    res.contentType('image/png');
    res.end(await processImage(await response.blob()));
});

app.get('/neko', async (req, res) => {
    try {
        response = await fetch((await neko.neko()).url);
    } catch {
        return res.status(500).res({ message: 'Fail fetching image' });
    }

    res.contentType('image/png');
    res.end(await processImage(await response.blob()));
});

app.get('/loli', async (req, res) => {
    const value = Math.floor(Math.random() * 101);

    try {
        response = await (await fetch(`https://lolibooru.moe/post/index.json?tags=nude&limit=${value}`)).json();
    } catch {
        return res.status(500).send({ message: 'Fail requesting image' });
    }

    try {
        coolResponse = await fetch(response[value - 1].file_url);
    } catch {
        return res.status(500).send({ message: 'Fail fetching image' });
    }

    res.contentType('image/png');
    res.end(await processImage(await coolResponse.blob()));
});

app.get('/count', async (req, res) => { res.json({ count }); });
app.post('/count', async (req, res) => {
    ++count;
    res.json({ count });
});

app.listen(port, () => {
    console.log(`Listening in http://localhost:${port}`);
});