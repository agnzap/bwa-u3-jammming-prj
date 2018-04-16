let accessToken;
let tokenExpiresIn;
const clientId = '4194bd2fc7be4634a5fe8e4a25131c69';
const redirectURI = "http://localhost:3000/";


const Spotify =  {

  getAccessToken() {
    if (accessToken) {
      return accessToken;

    } else if (window.location.href.match(/access_token=([^&]*)/) != null) {
			accessToken = window.location.href.match(/access_token=([^&]*)/)[1];
			tokenExpiresIn = window.location.href.match(/expires_in=([^&]*)/)[1];
      window.setTimeout(() => accessToken = '', tokenExpiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;

    } else {
      window.location = `http://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
    }
  },

  search(term) {
      if(accessToken === undefined) {
        const accessToken = Spotify.getAccessToken();
      }
      console.log(this.accessToken);
      const headers = { Authorization: `Bearer ${accessToken}` }
       return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
         { headers: headers}).then(response => { return response.json(); }
       ).then(jsonResponse => {
           if (jsonResponse.tracks) {
               let tracks = jsonResponse.tracks.items.map(track => ({
                       id: track.id,
                       name: track.name,
                       artist: track.artists[0].name,
                       album: track.album.name,
                       uri: track.uri
               }));
              return tracks;
           } else {
               return [];
           }
       });
   },

   savePlaylist(playlistName, trackURIs) {
       if (!playlistName || !trackURIs) {
         return;
       }
       fetch("https://api.spotify.com/v1/me",
     {headers: {Authorization: `Bearer ${accessToken}`}}).then(response => {
       try {if (response.ok) {
         let jsonResponse = response.json();
         return jsonResponse;
       }
       throw new Error('error');
     } catch (error) {
       console.log(error);
     }
   }).then(jsonResponse => {
     let userID = jsonResponse.id;
     return jsonResponse.id;
   }).then(userID => fetch(`https://api.spotify.com/v1/users/${userID}/playlists`,
   {
     method: 'POST',
     headers: {'Authorization': `Bearer ${accessToken}`,
               'Content-Type': 'application/json'},
     body: JSON.stringify({name: playlistName})
   }).then(response => {
     console.log(response);
     try {if (response.ok) {
       let jsonResponse = response.json();
       return jsonResponse;
     }
   throw new Error('POST playlistName error');
   } catch (error) {
     console.log(error);
   }
   }).then(jsonResponse => {
     return jsonResponse.id;
   }).then(playlist_id => fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlist_id}/tracks`,
   {
     method: 'POST',
     headers: {'Authorization': `Bearer ${accessToken}`,
               'Content-Type': 'application/json'},
     body: JSON.stringify({uris: trackURIs})
   })))
     }


}

export default Spotify;
