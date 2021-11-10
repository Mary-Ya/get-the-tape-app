var utils = require('../utils');
var request = require('request'); // "Request" library

const hasError = (err) => {
  return err !== null && err;
}

const processRes = (error, response) => {
  console.log(`processRes: ${response.statusCode}`);
  if (response.statusCode > 199 || response.statusCode < 300) {
    console.log(`response: ${JSON.stringify(response.body)}`);
    return response
  }
  
  console.log(`error: ${error}`);
  return error
}

function defaultHandler (res, error, response) {
  res.status(response.statusCode).send(processRes(error, response));
}

module.exports = {
  getById: (req, res) => {
    var reqOptions = {
      url: `https://api.spotify.com/v1/playlists/${req.query.playlistId}`,
      headers: {
        'Authorization': `Bearer ${req.query.access_token}`
      },
      json: true
    };
    request.get(reqOptions, (error, response) => defaultHandler(res, error, response))
  },
  unfollow: (req, res) => {
    var reqOptions = {
      url: `https://api.spotify.com/v1/playlists/${req.query.playlist_id}/followers`,
      headers: {
        'Authorization': `Bearer ${req.query.access_token}`
      },
      json: true
    };
    request.delete(reqOptions, (error, response) => defaultHandler(res, error, response))
  },
  create: (req, res) => {
    var reqOptions = {
      url: `https://api.spotify.com/v1/users/${req.query.userId}/playlists`,
      form: req.query.data,
      headers: {
        'Authorization': `Bearer ${req.query.access_token}`
      },
      json: true
    };
    request.post(reqOptions, (error, response) => defaultHandler(res, error, response))
  },
  update: (req, res) => {
    var reqOptions = {
      url: `https://api.spotify.com/v1/playlists/${req.query.playlist_id}/tracks`,
      form: JSON.stringify([...req.query.urisList]),
      headers: {
        'Authorization': `Bearer ${req.query.access_token}`
      },
      json: true
    };
    console.log('update-playlist ' + req.query.playlist_id)
    console.log([...req.query.urisList])

    request.post(reqOptions, (error, response) => defaultHandler(res, error, response));
  },
  getList: (req, res) => {
    // add multiple list pages 
    var reqOptions = {
      url: `https://api.spotify.com/v1/me/playlists?limit=${req.query.limit}&offset=${req.query.offset}`,
      headers: {
        'Authorization': `Bearer ${req.query.access_token}`
      },
      json: true
    };
    request.get(reqOptions, (error, response) => defaultHandler(res, error, response))
  }
};