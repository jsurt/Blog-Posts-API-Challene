const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

const {runServer, closeServer, app} = require('../server');

describe('Blog Posts', function() {

    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should retrieve blog posts on GET', function() {
        return chai
            .request(app)
            .get('/blog-posts')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                //Ask Ali about line 27. Why isn't the group of posts and array?
                expect(res).to.be.a('object');
                expect(res.body.length).to.be.at.least(1);
                const expectedKeys = ["id", "title", "content", "author"];
                res.body.forEach(function(item) {
                    expect(item).to.be.a('object');
                    expect(item).to.include.keys(expectedKeys);
                });
            });
    });

    it('should create blog posts on POST', function() {
        const createItem = {
            title: "What is going on?",
            content: "Lorem ipsum and dipsum and some other stuff",
            author: "Confused Confucius"
        }
        return chai
            .request(app)
            .post('/blog-posts')
            .send(createItem)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a("object");
                expect(Object.keys(res.body).length).to.be.at.least(1);
                const expectedKeys = ["id", "title", "content", "author"];
                expectedKeys.forEach(function(key) {
                    expect(res.body).to.include.keys(key);
                });
                expect(res).to.not.equal(null);
                expect(res.body).to.deep.equal(
                    Object.assign({}, createItem, {id: res.body.id, publishDate: res.body.publishDate})
                );
            })
    });

    it("should update blog posts on PUT", function() {
        return (
          chai
            .request(app)
            // first have to get
            .get("/blog-posts")
            .then(function(res) {
              const updatedPost = Object.assign(res.body[0], {
                title: "connect the dots",
                content: "la la la la la"
              });
              return chai
                .request(app)
                .put(`/blog-posts/${res.body[0].id}`)
                .send(updatedPost)
                .then(function(res) {
                  //expect(res).to.have.status(204);
                });
            })
        );
      });

    it('should delete items on DELETE', function() {
        return(chai
            .request(app)
            .get(`/blog-posts/`)
            .then(function(res) {
                return chai
                .request(app)
                .delete(`/blog-posts/${res.body[0].id}`)
                .then(function(res) {
                    expect(res).to.have.status(204);
                })
            })
        );
    });

});

