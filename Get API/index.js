// define constants 
const http = require('http');
const readline = require('readline-sync');
const fetch = require('node-fetch');

// Provide client id and client secret, Needed to get api access token
//found on spotify developer website
const clientId = '7c2f5c3932ec43f9b6b4487912347d5c';  
const clientSecret = 'c43404979550442483513a26aeab029a'; 

/*get access token, function that calls on spotify api and provides 
  the access token needed to make API calls and uses the ClientID and Client sdecret  for 
  verification*/
async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

//Function to search for song 
/* asks user for song name then calls API search protocal 
tehn collects basic song data suc as id,name,artiost and album */

async function Search(query, accessToken) {
  const  response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data.tracks.items.map(track => ({
    id:track.id,
    name: track.name,
    artists: track.artists.map(artist => artist.name).join(', '),
    album: track.album.name
  }));
}
// Function to fetch track detailes using ID and an access token
async function fetchTrackData(trackId, accessToken, fetch) {
  //request to the Spotify
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  // Logs API response to the console for debugging
  const data = await response.json();
  console.log('Search API response:', data);
  //return info for track
  return {
    Id: data.id,
    artists: data.artists.map(artist => artist.name).join(', '),
    song: data.name,
    preview_url: data.preview_url,
    album: data.album.name,
  };
}
  // return data.tracks.items.map(track => ({
  //   Id: track.id,
  //   artists: track.artists.map(artist => artist.name).join(', '),
  //   song: track.name,
  //   preview_url: track.preview_url,
  //   album: track.album.name,
  // }));
  // };

(async () => {
  // Prompt the user to enter the Spotify track name 
  const trackName = readline.question('Enter the Spotify track name: ');

  try {
     
     // Prompt the user to enter the Spotify track name
    const accessToken = await getAccessToken();

    const trackData = await Search(trackName, accessToken);
    // Check if any tracks were found
    if (trackData.length === 0) {
      console.log("No Spotify track found");
      return
    }
    //Sshow tracks for selection
    console.log('Searching song: ')
    trackData.forEach((track, index) => {
      console.log(`${index + 1}. ${track.name} by ${track.artists} (Album: ${track.album})`)
    });
    //error check for input
    const reqTrack = readline.questionInt('Enter the number of the track you want to fetch details for: ') - 1;
    if (reqTrack < 0 || reqTrack >= trackData.length) {
      console.log('Invalid input chosen')
      return
    }

    const reqTrackID = trackData[reqTrack].id;
    //retrieving details of track
    const tData= await fetchTrackData(reqTrackID, accessToken, fetch);
    //displaying output
    console.log(`\nArtists: ${tData.artists}`);
    console.log(`Song: ${tData.song}`);
    console.log(`Preview URL: ${tData.preview_url}`);
    console.log(`Album: ${tData.album}`);
  } catch (error) {
    console.error('Error fetching track data:', error);
  }
})();
