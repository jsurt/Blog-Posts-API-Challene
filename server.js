//Set up express app
const express = require('express');
const morgan = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');

app.use(morgan('common'));
app.use(express.json());

app.use(express.static('public'));


app.get('/blog-posts', (req, res) => {
    console.log('test');
    BlogPost
        .find({})
        .then(BlogPosts => res.json(
            BlogPosts.map(blogPosts => blogPosts.serialize())
        ))
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: 'Server error'})
        });
});

app.get('/blog-posts/:id', (req, res) => {
    BlogPost   
        .findById(req.params.id)
        .then(blogPosts => res.json(blogPosts.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

app.post('/blog-posts', function(req, res) {
    BlogPost.create({
        title: req.body.title,
        author: {
            firstName: req.body.firstName,
            lastName: req.body.lastName
        },
        content: req.body.content
    })
    .then(blogPost => res.status(201).json(blogPost.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'server error'});
    })
});

app.put('/blog-posts/:id', function(req, res) {
    if(req.params.id !== req.body.id) {
        res.status(404).send("error");
    }
    BlogPost.findByIdAndUpdate(
        req.params.id,
        {
        title: req.body.title,
        author: {
            firstName: req.body.firstName,
            lastName: req.body.lastName
        },
        content: req.body.content
    })

    .then(blogPost => res.status(200).json(blogPost.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'server error'});
    })
})


let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            databaseUrl, 
            (err) => {
                if (err) {
                    return reject(err);
                }
                server = app
                .listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', (err) => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close((err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    })
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};


