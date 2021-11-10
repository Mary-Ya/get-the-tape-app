var utils = require('../utils');
var request = require('request'); // "Request" library

const searchRequest = (req, res) => {
  var access_token = req.query.access_token;
  var {
    market,
    limit,
    offset,
    q, type
  } = req.query;

  var reqOptions = {
    url: `https://api.spotify.com/v1/search?q=${q ? q : utils.generateRandomString(1)}&type=${type}&market=${market}&limit=${limit}&offset=${offset}`,
    headers: {
      'Authorization': `Bearer ${access_token}`
    },
    json: true
  };

  return request.get(reqOptions, function (error, response, body) {
    res.send(body);
  })
}

const trackRequest = (req, res) => {
  var reFetchCounter = 0;
  var access_token = req.query.access_token;
  var {
    market,
    offset,
    q
  } = req.query;

  var reqOptions = {
    url: `https://api.spotify.com/v1/search?q=${q ? q : utils.generateRandomString(1)}&type=track&market=${market}&limit=1&offset=${offset}`,
    headers: {
      'Authorization': `Bearer ${access_token}`
    },
    json: true
  };

  return request.get(reqOptions, function (error, response, body) {
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
  })
};
  
module.exports = {
  trackRequest,
  searchRequest,
  getRecommendations: (req, res) => {
    // https://api.spotify.com/v1/recommendations
    const { access_token, limit, market,
      seed_genres, seed_tracks, seed_artists,
      id, min_tempo, max_tempo } = req.query;
    var options = utils.getRecommendations(access_token,
      limit,
      market,
      seed_genres,
      seed_tracks,
      seed_artists,
      id,
      { min_tempo, max_tempo, seed_tracks }
    );
    console.log('options ' + options.url);
    // use the access token to access the Spotify Web API
    request.get(options, function (error, response, body) {
      res.send(body);
    });
  },

  getRecommendationGenres: (req, res) => {
    // https://api.spotify.com/v1/recommendations
    var options = {
      url: `https://api.spotify.com/v1/recommendations/available-genre-seeds`,
      headers: { 'Authorization': 'Bearer ' + req.query.access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, function (error, response, body) {
      res.send(response.body);
    });
  }
};

