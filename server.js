/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

 var express = require('express'); // Express web server framework
 const path = require('path');

 var request = require('request'); // "Request" library
 var cors = require('cors');
 var querystring = require('querystring');
 var cookieParser = require('cookie-parser');
 
 var client_id = 'f9ddb7ab8b394323a2cf45a1bf95c4d9'; // Your client id
 var client_secret = '0a80a1e2e1724f68b703184c2388000c'; // Your secret
 var redirect_uri = 'http://127.0.0.1:8888/callback'; // Your redirect uri
 
var utils = require('./utils');
var tracks = require('./routes/tracks');
var user = require('./routes/user');
var getTheTape = require('./routes/get-the-tape');

 var stateKey = 'spotify_auth_state';
 
 var app = express();
 
 app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());
 
app.get('/save_playlist', function (res, req) {
  // create playlist

  // add items to a Playlist

  // return link to the playlist or name
})
 
app.get('/login', user.login);

 app.get('/get_random_track', tracks.trackRequest);
 
app.get('/recommendations', tracks.getRecommendations);

 app.get('/recommendation-genres', tracks.getRecommendationGenres)

app.get('/get-the-tape', getTheTape.mane)

 app.get('/callback', function(req, res) {
 
   // your application requests refresh and access tokens
   // after checking the state parameter
 
   var code = req.query.code || null;
   var state = req.query.state || null;
   var storedState = req.cookies ? req.cookies[stateKey] : null;
  console.log('state: ' + state, ', storedState: ', storedState)
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
 });
 
app.get('/create-play-list', function (req, res) {
    var reqOptions = {
      url: `https://api.spotify.com/v1/users/${req.query.userId}/playlists`,
      form: req.query.data,
      headers: { 'Authorization': `Bearer ${req.query.access_token}` },
      json: true
    };
    console.log(req.query.data)
    request.post(reqOptions, function (error, response, body) {
      res.send(response || error);
    })
})

app.get('/update-play-list', function (req, res) {
  var reqOptions = {
    url: `https://api.spotify.com/v1/playlists/${req.query.playlist_id}/tracks`,
    form: JSON.stringify([ ...req.query.urisList ]),
    headers: { 'Authorization': `Bearer ${req.query.access_token}` },
    json: true
  };
  console.log('update-play-list ' + req.query.playlist_id)
  console.log([ ...req.query.urisList ])

  request.post(reqOptions, function (error, response, body) {
    res.send(response || error);
  })
})

app.get('/get-play-list-list', function (req, res) {
  // add multiple list pages 
  var reqOptions = {
    url: `https://api.spotify.com/v1/me/playlists?limit=100`,
    headers: { 'Authorization': `Bearer ${req.query.access_token}` },
    json: true
  };
  request.get(reqOptions, function (error, response, body) {
    res.send(response || error);
  })
})

app.get('/get-play-list', function (req, res) {
  var reqOptions = {
    url: `https://api.spotify.com/v1/playlists/{playlist_id}`,
    headers: { 'Authorization': `Bearer ${req.query.access_token}` },
    json: true
  };
  request.get(reqOptions, function (error, response, body) {
    res.send(response || error);
  })
})

 app.get('/refresh_token', function(req, res) {
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
 });

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

 console.log('Listening on 8888');
 app.listen(8888);