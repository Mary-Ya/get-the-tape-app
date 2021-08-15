var utils = require('../utils');
var request = require('request'); // "Request" library
var querystring = require('querystring');

var stateKey = 'spotify_auth_state';

var client_id = 'f9ddb7ab8b394323a2cf45a1bf95c4d9'; // Your client id
var client_secret = '0a80a1e2e1724f68b703184c2388000c'; // Your secret
var redirect_uri = 'http://127.0.0.1:8888/callback'; // Your redirect uri

module.exports = {
    auth: function(req, res) {
 
        // your application requests refresh and access tokens
        // after checking the state parameter
      
        var code = req.query.code || null;
        var state = req.query.state || null;
        var storedState = req.cookies ? req.cookies[stateKey] : null;
        if (state === null || state !== storedState) {
          res.redirect('/#' +
            querystring.stringify({
              error: 'state_mismatch'
            }));
        } else {
          res.clearCookie(stateKey);
          var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
              code: code,
              redirect_uri: redirect_uri,
              grant_type: 'authorization_code'
            },
            headers: {
              'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
          };
     
          request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
      
              var access_token = body.access_token,
                  refresh_token = body.refresh_token;
      
              var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
              };
      
              // use the access token to access the Spotify Web API
              request.get(options, function(error, response, body) {
                console.log(body);
              });
      
              // we can also pass the token to the browser to make requests from there
              res.redirect('/home?' +
                querystring.stringify({
                  access_token: access_token,
                  refresh_token: refresh_token
                }));
            } else {
              res.redirect('/#' +
                querystring.stringify({
                  error: 'invalid_token'
                }));
            }
          });
        }
      },
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
    },
    refreshToken: (req, res) => {
        // requesting access token from refresh token
        var refresh_token = req.query.refresh_token;
        var authOptions = {
          url: 'https://accounts.spotify.com/api/token',
          headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
          form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
          },
          json: true
        };
      
        request.post(authOptions, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            console.log('success!', access_token)
            res.send({
              'access_token': access_token,
              'refresh_token': refresh_token
            });
          } else {
            console.log('error', body, response.statusCode);
          }
        });
      }
}