// requires
var mongoose = require('mongoose');
var User = mongoose.model('User');
var utils = require('../utils/utils');

/** Creates (register) a new user with supplied info
 * @param req HTTP request object
 * @param res HTTP response object
 */
var registerUser = function (req, res) {
    // body must contain at least the user's name
    if (!req.body.name) {
        return utils.sendJSONResponse(res, 400, {msg: 'Please supply at least the user\'s name'});
    }

    // save user in database
    User.create({
        name: req.body.name,
        isAdmin: req.body.isAdmin,
        connections: []
    }, function(err, user) {
        if (err) {
            // check for "duplicate key error"; mongo returns this error if "unique" constraint for a field is violated
            // could also check for error code (11xxx)
            if (err.errmsg.indexOf("duplicate key error index") != -1) {
                return utils.sendJSONResponse(res, 400, {msg: 'Duplicate name. Please choose another name'});
            }

            // respond with error
            return utils.sendJSONResponse(res, 400, {msg: 'Error', data: err});
        } else {
            // return only name and uuid for user
            var returnedUser = {
                name: user.name,
                uuid: user.uuid
            };

            // respond with success
            utils.sendJSONResponse(res, 201, {msg: 'User created successfully.', data: returnedUser});
        }
    });
};

/** Search for existing users based on request query filter.
 * @param req HTTP request object.
 * @param res HTTP response object
 */
var searchUsers = function (req, res) {
    // find user that wants to do the search
    User.findOne({
        uuid: req.params.userId
    }).exec(function(err, user) {
        // respond with error
        if (err) {
            return utils.sendJSONResponse(res, 400, {msg: 'Error', data: err});
        }

        // user not found
        if (!user) {
            return utils.sendJSONResponse(res, 400, {msg: 'User (searching for other users) not found', data: err});
        }

        // make regex to match any user which contains supplied filter value
        var regexp = new RegExp('^' + (req.query.filter || ''));

        // find users matching regex
        User.find({
            name: regexp
        }).exec(function(err, users) {
            // respond with error
            if (err) {
                utils.sendJSONResponse(res, 400, {msg: 'Error', data: err});
            } else {
                // keep list of searched users. Add only their name, don't supply other info
                var usersWithoutDetails = [];
                users.forEach(function (currUser) {
                    // don't add the current user who is searching for users
                    if (user.name !== currUser.name) {
                        usersWithoutDetails.push(currUser.name);
                    }
                });

                // respond with success
                utils.sendJSONResponse(res, 200, {msg: 'Successfully retrieved list of users matching: ' + req.query.filter, data: usersWithoutDetails});
            }
        });
    });
};

/** Connect two users.
 * @param req HTTP request object.
 * @param res HTTP response object
 */
var connectUsers = function (req, res) {
    // find user that wants to do the search
    User.findOne({
        uuid: req.params.userId
    }).exec(function(err, userMakingConnection) {
        // respond with error
        if (err) {
            return utils.sendJSONResponse(res, 400, {msg: 'Error', data: err});
        }

        // user not found
        if (!userMakingConnection) {
            return utils.sendJSONResponse(res, 400, {msg: 'User trying to make connection not found', data: err});
        }

        // find user to connect with
        User.findOne({
            name: req.body.connectUserName
        }).exec(function(err, userToConnect) {
            if (userToConnect) {
                // make connection in both directions
                userMakingConnection.connections.push(userToConnect.uuid);
                userToConnect.connections.push(userMakingConnection.uuid);

                // save changes
                userMakingConnection.save();
                userToConnect.save();

                // respond with success
                utils.sendJSONResponse(res, 200, {
                    msg: 'Successfully created connection between: ' + userMakingConnection.name + ' and ' + userToConnect.name,
                    data: [ userMakingConnection.name, userToConnect.name ]
                });
            } else {
                // user not found
                utils.sendJSONResponse(res, 400, {msg: 'User to connect with was not found', data: err});
            }
        });
    });
};

/** Retrieve list of users. (available only for admin users)
 * @param req HTTP request object.
 * @param res HTTP response object
 */
var retrieveUsers = function (req, res) {
    // find admin user
    User.findOne({
        uuid: req.params.userId
    }).exec(function(err, user) {
        // respond with error
        if (err) {
            return utils.sendJSONResponse(res, 400, {msg: 'Error', data: err});
        }

        // admin user not found
        if (!user) {
            return utils.sendJSONResponse(res, 400, {msg: 'Admin user not found', data: err});
        }

        // check user is admin
        if (user.isAdmin) {
            User.find({}).exec(function(err, users) {
                if (err) {
                    // respond with error
                    utils.sendJSONResponse(res, 400, {msg: 'Error', data: err});
                } else {
                    // respond with success
                    utils.sendJSONResponse(res, 200, {msg: 'Sucessfully retrieved list of users', data: users});
                }
            });
        } else {
            // user is not admin
            utils.sendJSONResponse(res, 401, {msg: 'Unauthorized'});
        }
    });
};

module.exports = {
    registerUser: registerUser,
    searchUsers: searchUsers,
    connectUsers: connectUsers,
    retrieveUsers: retrieveUsers
};