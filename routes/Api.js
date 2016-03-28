var express  = require('express');
var api  =  express.Router();
var Files = require('../handlers/Files');

api.get('/lists',Files.lists);
api.get('/upload',Files.upload);
module.exports =  api;