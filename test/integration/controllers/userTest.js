// requires
var chai = require('chai');
var should = chai.should();
var chaiHttp = require('chai-http');
var server = require('../../../app');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var basePath = '/api/users';
var registerUserPath = basePath;
var searchUsersPath = basePath + '/search';
var connectUsersPath = basePath + '/connect';
var retrieveUsersPath = basePath;

chai.use(chaiHttp);

var adminUser = {
    name: 'user0',
    uuid: null
};
var regularUser1 = {
    name: 'user1',
    uuid: null
};
var regularUser2 = {
    name: 'user2',
    uuid: null
};
var regularUser3 = {
    name: 'user3',
    uuid: null
};

describe('API tests', function () {
    // Before test suite, empty the database
    before(function (done) {
        User.remove({}, function (err) {
            done();
        });
    });

    // After test suite, empty the database
    after(function (done) {
        User.remove({}, function (err) {
            done();
        });
    });

    // Test API: register user
    describe('POST /users', function () {
        it('it should add a new user (admin)', function (done) {
            chai.request(server)
                .post(registerUserPath)
                .send({
                    "name": adminUser.name,
                    "isAdmin": true
                })
                .end(function (err, res) {
                    res.should.have.status(201);
                    res.body.data.name.should.equal(adminUser.name);

                    // cache admin user id for later use
                    adminUser.uuid = res.body.data.uuid;

                    done();
                });
        });
    });

    // Test API: get users
    describe('GET users', function () {
        it('it should retrieve all users', function (done) {
            chai.request(server)
                .get(retrieveUsersPath + '/' + adminUser.uuid)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.data.should.be.a('array');
                    res.body.data.length.should.be.eql(1);
                    res.body.data[0].name.should.equal(adminUser.name);
                    res.body.data[0].uuid.should.equal(adminUser.uuid);
                    res.body.data[0].isAdmin.should.be.true;

                    done();
                });
        });
    });

    // Test API: register user
    describe('POST /users', function () {
        it('it should add a new user (regular)', function (done) {
            chai.request(server)
                .post(registerUserPath)
                .send({
                    "name": regularUser1.name,
                    "isAdmin": false
                })
                .end(function (err, res) {
                    res.should.have.status(201);
                    res.body.data.name.should.equal(regularUser1.name);

                    // cache admin user id for later use
                    regularUser1.uuid = res.body.data.uuid;

                    done();
                });
        });
    });

    // Test API: register user
    describe('POST /users', function () {
        it('it should add a new user (regular)', function (done) {
            chai.request(server)
                .post(registerUserPath)
                .send({
                    "name": regularUser2.name,
                    "isAdmin": false
                })
                .end(function (err, res) {
                    res.should.have.status(201);
                    res.body.data.name.should.equal(regularUser2.name);

                    // cache admin user id for later use
                    regularUser2.uuid = res.body.data.uuid;

                    done();
                });
        });
    });

    // Test API: register user
    describe('POST /users', function () {
        it('it should add a new user (regular)', function (done) {
            chai.request(server)
                .post(registerUserPath)
                .send({
                    "name": regularUser3.name,
                    "isAdmin": false
                })
                .end(function (err, res) {
                    res.should.have.status(201);
                    res.body.data.name.should.equal(regularUser3.name);

                    // cache admin user id for later use
                    regularUser3.uuid = res.body.data.uuid;

                    done();
                });
        });
    });

    // Test API: register user
    describe('POST /users', function () {
        it('it should NOT add user due to duplicate name error', function (done) {
            chai.request(server)
                .post(registerUserPath)
                .send({
                    "name": regularUser3.name,
                    "isAdmin": false
                })
                .end(function (err, res) {
                    res.should.have.status(400);
                    res.body.message.should.equal('Duplicate name. Please choose another name');

                    done();
                });
        });
    });

    // Test API: get users
    describe('GET users', function () {
        it('it should retrieve all users (test 4 users are already created)', function (done) {
            chai.request(server)
                .get(retrieveUsersPath + '/' + adminUser.uuid)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.data.should.be.a('array');
                    res.body.data.length.should.be.eql(4);

                    var countAdmin = 0;
                    var countRegular = 0;
                    res.body.data.forEach(function(userEntry) {
                        if (userEntry.isAdmin) {
                            countAdmin++;
                        } else {
                            countRegular++;
                        }
                    });
                    countAdmin.should.equal(1);
                    countRegular.should.equal(3);

                    done();
                });
        });
    });

    // Test API: search users
    describe('GET search users', function () {
        it('it should search for users', function (done) {
            chai.request(server)
                .get(searchUsersPath + '/' + regularUser1.uuid)
                .query({filter: 'user'}) // /search?name=foo&limit=10
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.data.should.be.a('array');
                    res.body.data.length.should.be.eql(3);


                    // make sure 'user1' is not in the list (user who is searching for other users)
                    var userSearching = res.body.data.findIndex(function(userEntry) {
                        return userEntry === regularUser1.name;
                    });
                    userSearching.should.equal(-1);

                    var user2 = res.body.data.findIndex(function(userEntry) {
                        return userEntry === regularUser2.name;
                    });
                    var user3 = res.body.data.findIndex(function(userEntry) {
                        return userEntry === regularUser3.name;
                    });
                    // make sure 'user2' and 'user3' are in the list
                    user2.should.not.equal(-1);
                    user3.should.not.equal(-1);

                    done();
                });
        });
    });

    // Test API: connect users
    describe('POST /users/connect', function () {
        it('it should connect two users', function (done) {
            chai.request(server)
                .put(connectUsersPath + '/' + regularUser1.uuid)
                .send({
                    "connectUserName": regularUser3.name
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.data.should.be.a('array');
                    res.body.data.length.should.be.eql(2);

                    var user1 = res.body.data.findIndex(function(userEntry) {
                        return userEntry === regularUser1.name;
                    });
                    var user3 = res.body.data.findIndex(function(userEntry) {
                        return userEntry === regularUser3.name;
                    });
                    // make sure 'user1' and 'user3' are in the list
                    user1.should.not.equal(-1);
                    user3.should.not.equal(-1);

                    done();
                });
        });
    });

    // Test API: get users
    describe('GET users', function () {
        it('it should retrieve all users (test user1 and user3 have connection between them)', function (done) {
            chai.request(server)
                .get(retrieveUsersPath + '/' + adminUser.uuid)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.data.should.be.a('array');
                    res.body.data.length.should.be.eql(4);

                    var user1 = null;
                    var user3 = null;
                    res.body.data.forEach(function(userEntry) {
                        if (userEntry.name === regularUser1.name) {
                            user1 = userEntry;
                        }
                        if (userEntry.name === regularUser3.name) {
                            user3 = userEntry;
                        }
                    });

                    // test users have connected one with other
                    user1.connections[0].should.equal(user3.uuid);
                    user3.connections[0].should.equal(user1.uuid);

                    done();
                });
        });
    });

});