var request = require('request');
var credits = require('../../client_secret.json');

var DropBox = function () {
}

DropBox.prototype.init = function () {

}

DropBox.prototype.authorize = function () {
    var authUrl = 'https://www.dropbox.com/1/oauth2/authorize?';
    authUrl += "client_id="+credits.dropbox.client_id;
    authUrl += "&redirect_uri="+credits.dropbox.redirect_uri;
    authUrl += "&response_type=code";
    return authUrl;
}
module.exports =  DropBox;
// dropbox = new DropBox();
// dropbox.authorize();