var request = require('request'); // "Request" library
var utils = require('../utils');

module.exports = {
    mane: (req, res) => {
        // https://api.spotify.com/v1/recommendations
        const settings = JSON.parse(req.query.settings);
  
        const listOptions = utils.getRecommendations(req.query.access_token, Number(settings.limit) * 10, settings.market, settings.seed_genres)
        request.get(listOptions, function (error, response, body) {
            const errors = error || response.body.error;
            if (errors) {
                res.send(errors);
                return;
            };
            response.body.tracks ? '' : res.send({ response, body });

            const tracks = utils.filterTracksByPreviewAndLength(response.body.tracks, settings.limit);
            let updatedTracks = [];
            // Continues running even if one map function fails
  
            const reqList = tracks.map((i) => {
                const otherOptions = utils.getRecommendations(req.query.access_token, Number(settings.limit) * 3, settings.market, null, i.id);
                return new Promise(async function (response, rej) {
                    request.get(otherOptions, (error, altResponse, body) => { response(altResponse.body) })
                });
            })
            Promise.all(reqList).then(recommendationsForEachTrack => {
                console.log('before main return');
                const filteredRecommendations = recommendationsForEachTrack.map(recObject => ({ seed: recObject.seeds[0], tracks: utils.filterTracksByPreviewAndLength(recObject.tracks, 3) }));
                filteredRecommendations.forEach(recommendation => {
                    let newTrack = utils.getTrackById(tracks, recommendation.seed.id);
                    newTrack['alts'] = recommendation.tracks;
                    updatedTracks.push(newTrack);
                })
                res.send(updatedTracks);
            })
        })
    }
}