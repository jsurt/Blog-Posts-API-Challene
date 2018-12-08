const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');

BlogPosts.create('The Great Article', 'An article written by Hugh Great that is not great at all', 'Hugh Great', 'Who knows');
BlogPosts.create('A Boring Entry', 'A very boring and whiney entry', 'Stephen King');

router.get('/', (req, res) => {
    res.json(BlogPosts.get());
});

router.post('/', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Please enter the \'${field}\' field`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    const item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
    res.status(201).json(item);
});

router.delete('/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    const message = `Deleting item with id ${req.params.id}`;
    res.status(204).end();
});

router.put('/:id', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author', 'publishDate'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in requiredFields)) {
            const message = `Please enter the \'${field}\'`;
            console.error(message);
            return res.status(400).send(message);
        }
    } 
    if (req.params.id !== req.body.id) {
        const message = `Path id \'${req.params.id}\' and body id \'${req.body.id}\' do not match`;
        console.error(message);
        return res.status(400).send(message);
    }
    console.log(`Updating Blog Post with id \'${req.params.id}\'`);
    const updatedPost = BlogPosts.update({
        id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
    });
    res.status(204).end();
});

module.exports = router;