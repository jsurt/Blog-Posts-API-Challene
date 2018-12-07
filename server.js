//Set up express app
const express = require('express');
const morgan = require('express');
const chaiHttp = require('chai-http');

const app = express();

const blogPostsRouter = require('./blogPostsRouter');

app.use(chaiHttp);

//Log http layer
app.use(morgan('common'));
app.use(express.json());

app.use('/blog-posts', blogPostsRouter);

app.use(chaiHttp);

app.listen(process.env.PORT || 8080, () => {
    console.log(`App listening on port ${process.env.PORT || 8080}`)
})

let server;

function startServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
        server = app
            .listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve(server);
            })
            .on('error', err => {
                reject(err);
            });
    });
}

function stopServer() {
    return new Promise((resolve, reject) => {
        console.log('Closing Server')
        server.close(err => {
            if(err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

if (require.main === module) {
    startServer().catch(err => console.error(err));
  }

module.exports = {startServer, stopServer, app};