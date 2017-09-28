// requires
var mongoose = require('mongoose');
var uuid = require('node-uuid');

// define user schema
var userSchema = new mongoose.Schema({
    uuid: { type: String, required: true, default: uuid.v1 },
    name: { type: String, required: true, unique: true },
    connections: { type: [ String ] },
    isAdmin: { type: Boolean, default: false }
});

// compile mongoose schema
mongoose.model('User', userSchema, 'users');