



module.exports = {
    getRecommendations: (access_token, limit = 3, market, genreSeeds, track) => {
        const trackQuery = track ? `&seed_tracks=${track}` : '';
        const genreQuery = genreSeeds ? `&seed_genres=${genreSeeds}` : '';
        return {
            url: `https://api.spotify.com/v1/recommendations?market=${market}&limit=${limit}${trackQuery}${genreQuery}`,
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
    }
}
   
