(function() {

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
    }

    /**
    * Generates a string for random search query
    * @return String
    */
    function getRandomSearchQuery() {
      // A list of all characters that can be chosen.
      const characters = 'abcdefghijklmnopqrstuvwxyz';
      
      // Gets a random character from the characters string.
      const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));
      let randomSearch = randomCharacter;

      return randomSearch;
    }

    /**
    *
    *
    */
    function getRandomNumber(max = 1000) {
        return Math.floor(Math.random() * max);
    }

    async function getRandomTrack(params) {
        return await $.ajax({
            url: `/get_random_track`,
            data: params
        }).error((response) => {
            userProfilePlaceholder.innerHTML = userProfileTemplate(response);
              window.spotigame =response;
                console.log(response)
              $('#login').hide();
              $('#loggedin').show();
        });
    }

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');

    var oauthSource = document.getElementById('oauth-template').innerHTML,
        oauthTemplate = Handlebars.compile(oauthSource),
        oauthPlaceholder = document.getElementById('oauth');

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
      alert('There was an error during the authentication');
    } else {
      if (access_token) {
        // render oauth info
        oauthPlaceholder.innerHTML = oauthTemplate({
          access_token: access_token,
          refresh_token: refresh_token
        });

        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
              userProfilePlaceholder.innerHTML = userProfileTemplate(response);
              window.spotigame = response;
              window.spotigame.access_token = access_token;
              
                console.log(response)
              $('#login').hide();
              $('#loggedin').show();

            }
        });
      } else {
          // render initial screen
          $('#login').show();
          $('#loggedin').hide();
      }

      document.getElementById('fetch-random-song').addEventListener('click', function() {
        getRandomTrack({
            market: window.spotigame.country,
            q: getRandomSearchQuery(),
            offset: getRandomNumber(),
            access_token: window.spotigame.access_token
        }).then(res => {
            const trackData =  JSON.parse(res).body.tracks.items[0];
            window.spotigame.currentTrack = trackData;

            var trackInfoSource = document.getElementById('track-info-template').innerHTML,
            trackInfoTemplate = Handlebars.compile(trackInfoSource),
            trackInfoPlaceholder = document.getElementById('track-info');

            trackInfoPlaceholder.innerHTML = trackInfoTemplate(trackData);
            console.log(trackData)
        });
      })
      
      document.getElementById('play-test').addEventListener('click', function() {
        window.spotigame.audioObj = new Audio(window.spotigame.currentTrack.preview_url || window.spotigame.currentTrack.href);
        window.spotigame.audioObj.play();
      })
      document.getElementById('play-test-stop').addEventListener('click', function() {
        window.spotigame.audioObj.pause();
      })

      document.getElementById('obtain-new-token').addEventListener('click', function() {
        $.ajax({
          url: '/refresh_token',
          data: {
            'refresh_token': refresh_token
          }
        }).done(function(data) {
          access_token = data.access_token;
          window.spotigame.access_token;
          console.log(data)
          oauthPlaceholder.innerHTML = oauthTemplate({
            access_token: access_token,
            refresh_token: refresh_token
          });
        });
      }, false);
    }
  })();