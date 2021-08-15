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

var cors = require('cors');
var cookieParser = require('cookie-parser');

var tracks = require('./routes/tracks');
var user = require('./routes/user');
var getTheTape = require('./routes/get-the-tape');
var playlist = require('./routes/playlist');

var app = express();

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/callback', user.auth);
app.get('/login', user.login);
app.get('/refresh_token', user.refreshToken);

app.get('/get_random_track', tracks.trackRequest);
app.get('/search', tracks.searchRequest);
app.get('/recommendations', tracks.getRecommendations);
app.get('/recommendation-genres', tracks.getRecommendationGenres)

app.get('/get-the-tape', getTheTape.mane)


app.get('/get-play-list-list', playlist.getList)
app.get('/get-play-list', playlist.getById);
app.get('/create-play-list', playlist.create);
app.get('/update-play-list', playlist.update);
app.get('/save_playlist', function (res, req) {
  // create playlist

  // add items to a Playlist

  // return link to the playlist or name
})


// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

console.log('Listening on 8888');
app.listen(8888);