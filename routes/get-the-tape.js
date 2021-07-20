var request = require('request'); // "Request" library
var utils = require('../utils');

module.exports = {
    mane: (req, res) => {
        // https://api.spotify.com/v1/recommendations
        const settings = JSON.parse(req.query.settings);
        const {limit, market, seed_genres, min_tempo, max_tempo } = settings;
        const listOptions = utils.getRecommendations(req.query.access_token,
            Number(req.query.limit) * 10,
            null,
            Object.assign(settings)
        );

        request.get(listOptions, function (error, response, body) {
            const errors = error || response.body.error;
            if (errors) {
                res.send(errors);
                return;
            };
            response.body.tracks ? '' : res.send({ response, body });

            const tracks = utils.filterTracksByPreviewAndLength(response.body.tracks, req.query.limit);
            let updatedTracks = [];
            // Continues running even if one map function fails
  
            const reqList = tracks.map((i) => {
                const otherOptions = utils.getRecommendations(
                    req.query.access_token,
                    Number(req.query.limit) * 3,
                    i.id
                );
                return new Promise(async function (response, rej) {
                    request.get(otherOptions, (error, altResponse, body) => { response(altResponse.body) })
                });
            });
            Promise.all(reqList).then(recommendationsForEachTrack => {
                const filteredRecommendations = recommendationsForEachTrack
                    // .filter((value) => (!(value.error)))
                    .map(recObject => ({ seed: recObject.seeds[0], tracks: utils.filterTracksByPreviewAndLength(recObject.tracks, 3) }));
                filteredRecommendations.forEach(recommendation => {
                    let newTrack = utils.getTrackById(tracks, recommendation.seed.id);
                    newTrack['alts'] = recommendation.tracks;
                    updatedTracks.push(newTrack);
                })
                res.send(updatedTracks);
            });
        })
    }
}