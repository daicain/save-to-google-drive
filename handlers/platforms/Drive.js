var google = require('googleapis');
var googleAuth = require('google-auth-library');
var credit = require('../../client_secret.json');
function Drive() {
}
Drive.prototype.init = ()=> {
    this.credits = {
        client_id: credit.web.client_id,
        client_secret: credit.web.client_secret,
        redirect: credit.web.redirect_uris[0]
    };
    this.SCOPES = credit.web.scopes;
}
Drive.prototype.connect = ()=> {
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(this.credits.client_id, this.credits.client_secret, this.credits.redirect);
    return oauth2Client;
}
Drive.prototype.getAuthUrl = oauth2Client => {
    var authUrl = oauth2Client.generateAuthUrl(
        {
            access_type: 'offline',
            scope: this.SCOPES
        }
    );
    return authUrl;
}

Drive.prototype.files = ()=> {

}
module.exports = Drive;