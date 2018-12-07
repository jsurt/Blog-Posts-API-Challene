const expect = require('chai').expect;
const models = require('../models');
const chai = require('chai');
const chaiHttp = require('chai-http');


const {startServer, stopServer, app} = require('../server');

describe('Blog Posts', function() {

    before(function() {
        return startServer();
    });

    after(function() {
        return stopServer();
    })

    it('should retrieve blog posts on GET', function() {
        return chai
            .request(app)
            .get('/blog-posts')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res).to.be.a('array');
                expect(res.body.length).to.be.at.least(1);
                const expectedKeys = ["id", "title", "content", "author", "publishDate"];
                res.body.forEach(function(item) {
                    expect(item).to.be.a('object');
                    expect(item).to.include.keys(expectedKeys);
                });
            });
    });

    it('should create blog posts on POST', function() {

    });

});

