var utils = require('../utils');
var request = require('request'); // "Request" library

module.exports = {
    getById: (req, res) => {
        var reqOptions = {
          url: `https://api.spotify.com/v1/playlists/${req.query.playlistId}`,
          headers: { 'Authorization': `Bearer ${req.query.access_token}` },
          json: true
        };
        request.get(reqOptions, function (error, response, body) {
          res.send(response || error);
        })
    },
    create: (req, res) => {
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
    },
    update: (req, res) => {
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
    },
    getList: (req, res) => {
        // add multiple list pages 
        var reqOptions = {
          url: `https://api.spotify.com/v1/me/playlists?limit=100`,
          headers: { 'Authorization': `Bearer ${req.query.access_token}` },
          json: true
        };
        request.get(reqOptions, function (error, response, body) {
          res.send(response || error);
        })
      }
};