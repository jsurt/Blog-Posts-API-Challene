'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { Author, BlogPost } = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());


app.get('/authors', (req, res) => {
  Author
    .find()
    .then(authors => {
      res.json(authors.map(author => {
        return {
          id: author._id,
          name: `${author.firstName} ${author.lastName}`,
          userName: author.userName
        };
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});


app.post('/authors', (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'userName'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  Author
    .findOne({ userName: req.body.userName })
    .then(author => {
      if (author) {
        const message = `Username taken`;
        console.error(message);
        return res.status(400).send(message);
      }
      else {
        Author
          .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
          })
          .then(author => res.status(201).json({
              _id: author.id,
              name: `${author.firstName} ${author.lastName}`,
              userName: author.userName
            }))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});


app.put('/authors/:id', (req, res) => {
  if (!(req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['firstName', 'lastName', 'userName'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Author
    .findOne({ userName: updated.userName || '', _id: { $ne: req.params.id } })
    .then(author => {
      if(author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      }
      else {
        Author
          .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
          .then(updatedAuthor => {
            res.status(200).json({
              id: updatedAuthor.id,
              name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
              userName: updatedAuthor.userName
            });
          })
          .catch(err => res.status(500).json({ message: err }));
      }
    });
});


app.delete('/authors/:id', (req, res) => {
  BlogPost
    .remove({ author: req.params.id })
    .then(() => {
      Author
        .findByIdAndRemove(req.params.id)
        .then(() => {
          console.log(`Deleted author with id ${req.params.id}`);
          res.status(204).json({ message: 'success' });
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});


app.get('/blog-posts', (req, res) => {
  BlogPost
    .find()
    .then(blogposts => {
      res.json(blogposts.map(function(blogposts) {
          return blogposts.serialize();
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});

app.get('/blog-posts/:id', (req, res) => { 
    console.log(req.params.id);
    BlogPost 
        .findById(req.params.id)
        .then(blogposts => {
            res.json(blogposts.serialize());
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: `Server error`});
        })
});

app.post('/blog-posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author_id'];
    requiredFields.map((field) => {
        if(!(field in req.body)) {
            const message = `Missing ${field} field in request body`;
            console.error(message);
            res.status(400).send(message);
        }
    });
    Author
        .findById(req.body.author_id)
        .then((author) => {
            if (author) {
                BlogPost
                    .create({
                        title: req.body.title,
                        content: req.body.content,
                        author: req.body.id
                    })
                    .then(blogPost => res.status(201).json({
                        id: blogPost.id,
                        author: `${author.firstName} ${author.lastName}`,
                        content: blogPost.content,
                        title: blogPost.title,
                        comments: blogPost.comments
                    }))
                    .catch((err) => {
                        console.error(err);
                        res.status(500).json({error: 'Houston we have a problem'})
                    })
            }
        })
    
});

app.put('/blog-posts/:id', (req, res) => {
    if(req.params.id !== req.body.id) {
        const message = 'Request path id and body id must match';
        console.error(message);
        res.status(400).send(message);
    }
    const updated = {};
    const updateableFields = ['title', 'content'];
    updateableFields.forEach((field) => {
        if (field in req.body) {
            updated[field] = req.body[field]
        }
    BlogPost 
        .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
        .then((updatedBlogPost) => {
            res.status(200).json({
                id: updatedBlogPost.id,
                title: updatedBlogPost.title,
                content: updatedBlogPost.content
            })
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: err});
        })
    });

});

app.delete('/blog-posts/:id', (req, res) => {
    BlogPost
        .findByIdAndRemove(req.params.id)
        .then(
            res.status(204).json({message: 'Blog post has been deleted'}).end()
        )
});

let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
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
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}


if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };
