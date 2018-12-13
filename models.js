const uuid = require('uuid');
const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
  title: String,
  author: {
    firstName: String,
    lastName: String
  },
  content: String
},
{ 
  toJSON: { virtuals: true }
}
);

blogPostSchema.virtual('authorFullName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim()});

blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    author: this.authorFullName,
    content: this.content
  }
} 

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};