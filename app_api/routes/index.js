var express = require('express');
var router = express.Router();
var ctrlUsers = require('../controllers/user');

// add routes
router.post('/users', ctrlUsers.registerUser);
router.get('/users/search/:userId', ctrlUsers.searchUsers);
router.put('/users/connect/:userId', ctrlUsers.connectUsers);
router.get('/users/:userId', ctrlUsers.retrieveUsers);

module.exports = router;
