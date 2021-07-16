var utils = require('../utils');
var request = require('request'); // "Request" library

module.exports = {
    login: (req, res) => {
        var state = utils.generateRandomString(16);
        res.cookie(stateKey, state);
  
        // your application requests authorization
        var scope = 'user-read-private user-read-email streaming playlist-modify-public playlist-modify-private';
        res.redirect('https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'code',
                client_id: client_id,
                scope: scope,
                redirect_uri: redirect_uri,
                state: state
            }));
    }
}