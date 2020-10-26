# playlist-generator
A node.js backend system which helps create a random music playlist.

#### base URL
https://playlist-mpx.herokuapp.com/

#### APIs
method | route | return | Usage
------------| ------------ | ------------- | -------------
GET | get_first_song?user_id={Number} & category={String} | track_name, track_id, artist_name, lyrics |Retrieving the first song based on the given category
GET | get_next_song?user_id={Number} & track_id={Number} | track_name, track_id, artist_name, lyrics |Get 5 random words from the lyrics of the song based on the given track id and retrieve a song with those 5 random words

#### External APIs used
https://api.musixmatch.com/ws/1.1/track.search
https://api.musixmatch.com/ws/1.1/track.lyrics.get

#### Use scenario
A user types some key words and wants to create a customized music play list. The front end uses get_first_song API and key words to get information of the first song. Then the front recursively uses the track id of the last song and get_next_song API to retrieve information of the next song until no more data returned. 
