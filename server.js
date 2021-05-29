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
 
 /**
  * Generates a random string containing numbers and letters
  * @param  {number} length The length of the string
  * @return {string} The generated string
  */
 var generateRandomString = function(length) {
   var text = '';
   var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
   for (var i = 0; i < length; i++) {
     text += possible.charAt(Math.floor(Math.random() * possible.length));
   }
   return text;
 };
 
 var stateKey = 'spotify_auth_state';
 
 var app = express();
 
 app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

  function trackRequest (req, res) {
    var reFetchCounter = 0;
    var access_token = req.query.access_token;
    var {market, offset, q} = req.query;
  
    var reqOptions = {
       url: `https://api.spotify.com/v1/search?q=${q ? q : generateRandomString(1)}&type=track&market=${market}&limit=1&offset=${offset}`,
       headers: { 'Authorization': `Bearer ${access_token}` },
       json: true
    };

    return request.get(reqOptions, function(error, response, body) {
      console.log('error', error)
        if (!error && response.statusCode === 200) {
          // console.log('response.body.tracks.items[0]', response.body.tracks.items[0]);
          if (!response.body.tracks.items[0].preview_url && reFetchCounter < 4) {
            console.log('no preview: ' + reFetchCounter);
            reFetchCounter++;
            setTimeout(trackRequest, 1000, req, res);
          } else {
            console.log('YES preview: ' + reFetchCounter);
            reFetchCounter = 0;
            res.send(JSON.stringify(
              response
            ));
          }
        } else {
          reFetchCounter = 0;
          res.send('/error' +
            JSON.stringify(
              response
            ));
        }
     });
  }
 
 app.get('/get_random_track', function(req, res) {
   trackRequest(req, res);
 });

 app.get('/login', function(req, res) {
 
   var state = generateRandomString(16);
   res.cookie(stateKey, state);
 
   // your application requests authorization
   var scope = 'user-read-private user-read-email streaming';
   res.redirect('https://accounts.spotify.com/authorize?' +
     querystring.stringify({
       response_type: 'code',
       client_id: client_id,
       scope: scope,
       redirect_uri: redirect_uri,
       state: state
     }));
 });

const getRecommendations = (access_token, market, limit = 3, genre, track) => {
  const trackQuery = track ? `&seed_tracks=${track}` : '';
  const genreQuery = genre ? `&seed_genres=${genre}` : '';

  return {
    url: `https://api.spotify.com/v1/recommendations?market=${market}&limit=${limit}${trackQuery}${genreQuery}`,
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
 }
 
 app.get('/recommendations', function(req, res) {
   // https://api.spotify.com/v1/recommendations
   var options = getRecommendations(req.query.access_token, req.query.market, req.query.limit, req.query.genre, req.query.id)

    // use the access token to access the Spotify Web API
    request.get(options, function(error, response, body) {
      res.send(body);
    });
 })

const getTrackById = (tracks, id) => {
  const index = tracks.map(i => i.id).indexOf(id);
  return tracks[index];
 }
 
const filterTracksByPreviewAndLength = (tracks, limit) => {
  return tracks.filter(i => i.preview_url && i.preview_url.indexOf('/p.scdn.co/') > -1).slice(0, limit).map(i => {
    i['answers'] = [];
    return i;
  });
}

app.get('/get-the-tape', function (req, res) {
  // https://api.spotify.com/v1/recommendations
  const listOptions = getRecommendations(req.query.access_token, req.query.market, Number(req.query.limit) * 10, req.query.genre)

  // use the access token to access the Spotify Web API
  request.get(listOptions, function (error, response, body) {
    error ? res.send(error) : '';
    const tracks = filterTracksByPreviewAndLength(response.body.tracks, req.query.limit);
    let updatedTracks = [];
    // Continues running even if one map function fails

    const reqList = tracks.map((i) => {
      const otherOptions = getRecommendations(req.query.access_token, req.query.market, Number(req.query.limit) * 3, null, i.id);
      return new Promise(async function(response, rej) {
        request.get(otherOptions, (error, altResponse, body) => { response(altResponse.body) })
      });
    })
    Promise.all(reqList).then(recommendationsForEachTrack => {
      console.log('before main return');
      const filteredRecommendations = recommendationsForEachTrack.map(recObject => ({ seed: recObject.seeds[0], tracks: filterTracksByPreviewAndLength(recObject.tracks, 3) }));
      filteredRecommendations.forEach(recommendation => {
        console.log(recommendation)
        let newTrack = getTrackById(tracks, recommendation.seed.id);
        newTrack['alts'] = recommendation.tracks;
        updatedTracks.push(newTrack);
      })
      res.send(updatedTracks);
    })
  })
})

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
 
 app.get('/refresh_token', function(req, res) {
    console.log('refresh_token', req.query.refresh_token);
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
app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

 console.log('Listening on 8888');
 app.listen(8888);