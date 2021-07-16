



module.exports = {
    getRecommendations: (access_token, limit = 3, market, genreSeeds, track) => {
        const trackQuery = track ? `&seed_tracks=${track}` : '';
        const genreQuery = genreSeeds ? `&seed_genres=${genreSeeds}` : '';
        return {
            url: `https://api.spotify.com/v1/recommendations?market=${market}&limit=${limit}${trackQuery}${genreQuery}`,
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };
    }
}
   

