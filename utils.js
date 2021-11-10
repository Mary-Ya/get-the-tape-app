const makeRecQuery = (settings) => {
    let q = '';
        if (settings) {
            for (key in settings) {
                const option = settings[key];
                if (option) {
                    q = `&${key}=${option}`+q;
                }
            }
    }
    
    return q;
}
const optionalParamsOrder = {
    min_acousticness: 1,
    max_acousticness: 2,
    target_acousticness: 3,
    min_danceability: 4,
    max_danceability: 5,
    target_danceability: 6,
    min_duration_ms: 7,
    max_duration_ms: 8,
    target_duration_ms: 9,
    min_energy: 10,
    max_energy: 11,
    target_energy: 12,
    min_instrumentalness: 13,
    max_instrumentalness: 14,
    target_instrumentalness: 15,
    min_key: 16,
    max_key: 17,
    target_key: 18,
    min_liveness: 19,
    max_liveness: 20,
    target_liveness: 21,
    min_loudness: 22,
    max_loudness: 23,
    target_loudness: 24,
    min_mode: 25,
    max_mode: 26,
    target_mode: 27,
    min_popularity: 28,
    max_popularity: 29,
    target_popularity: 30,
    min_speechiness: 31,
    max_speechiness: 32,
    target_speechiness: 33,
    min_tempo: 34,
    max_tempo: 35,
    target_tempo: 36,
    min_time_signature: 37,
    max_time_signature: 38,
    target_time_signature: 39,
    max_valence: 40,
    target_valence: 41
}

const sortOptionalParamsForAPI = (data) => {
    let arrayInOrder = [];

    for (key in data) {
        const option = data[key];
        console.log(option + ' - ' +  data[key])
        if (option) {
            arrayInOrder[optionalParamsOrder[key]] = `&${key}=${data[key]}`;
        }
    }

    return arrayInOrder.join('');
}


module.exports = {
    getRecommendations: (access_token, limit = 3, track, otherSettings) => {
        const trackQuery = track ? `&seed_tracks=${track}` : '';
        //const genreQuery = genreSeeds ? `&seed_genres=${genreSeeds}` : '';
        const otherQueries = makeRecQuery(otherSettings);

        return {
            // url: `https://api.spotify.com/v1/recommendations?market=${market}&limit=${limit}${trackQuery}${genreQuery}${otherQueries}`,
            url: `https://api.spotify.com/v1/recommendations?limit=${limit}${otherQueries}${trackQuery}`,
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };
    },

    /**
     * Generates a random string containing numbers and letters
     * @param  {number} length The length of the string
     * @return {string} The generated string
    */
    generateRandomString: function(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
        for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    },

    getTrackById: (tracks, id) => {
        const index = tracks.map(i => i.id).indexOf(id);
        return tracks[index];
    },

    filterTracksByPreviewAndLength: (tracks, limit) => {
        return tracks.filter(i => i.preview_url && i.preview_url.indexOf('/p.scdn.co/') > -1).slice(0, limit).map(i => {
            i['answers'] = [];
            return i;
        });
    },
    makeRecQuery,
    sortOptionalParamsForAPI
}
   

