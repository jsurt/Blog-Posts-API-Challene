//Set up express app
const express = require('express');
const morgan = require('express');

const app = express();

const blogPostsRouter = require('./blogPostsRouter')

//Log http layer
app.use(morgan('common'));
app.use(express.json());

app.use('/blog-posts', blogPostsRouter);

app.listen(process.env.PORT || 8080, () => {
    console.log(`App listening on port ${process.env.PORT || 8080}`)
})