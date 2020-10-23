const axios = require('axios');
const apiConfig = require('../config/api.config');
const http = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    "Content-type": "application/json"
  }
})
const apiKey = apiConfig.apiKey2;
let history = {};
let lyricsHistory = {};

const shuffle = (arr) => {
  for (let i = arr.length - 1; i >= 0; i--) {
    const index = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[index]] = [arr[index], arr[i]];
  }
}

const callGetURL = async(url) => {
  try {
    const response = await http.get(url);
    const responseStatus = response.data.message.header.status_code;
    if (responseStatus >= 400 && responseStatus < 500) {
      throw `Bad response from the external API: ${apiConfig.baseURL}${url}`;
    }
    else {
      return response;
    }
  }
  catch(err) {
    console.log(err);
    const errorMessage = {
      status: 400,
      message: {
        error: `Failed to call external API.`,
      }
    }
    throw errorMessage;
  }
}

const getSong = async (res, userId, lyricsQuery) => {
  const trackSearchURL = `track.search?format=json&q_lyrics=${lyricsQuery}&quorum_factor=1&apikey=${apiKey}&page_size=100`;
  let trackSearchResult;
  try {
    trackSearchResult = await callGetURL(trackSearchURL);
  }
  catch(err) {
    return res.status(err.status).json(err.message);
  }

  const trackList = trackSearchResult.data.message.body.track_list;
  let track;
  shuffle(trackList);
  for (let i = 0; i < trackList.length; i++) {
    if (!history[userId].includes(trackList[i].track_id)) {
      track = trackList[i].track;
    }
  }

  if (track === undefined) {
    return res.status(404).json({
      error: "No tracks are found."
    })
  }

  const lyricsSearchURL = `track.lyrics.get?format=json&track_id=${track.track_id}&apikey=${apiKey}`;
  let lyrics;
  let lyricsResult;
  if (track.has_lyrics === 0) {
    lyrics = "";
  }
  else {
    try {
      lyricsResult = await callGetURL(lyricsSearchURL);
    }
    catch (err) {
      return res.status(err.status).json(err.message);
    }

    lyrics = lyricsResult.data.message.body.lyrics.lyrics_body;
  }

  history[userId].push(track.track_id);
  lyricsHistory[track.track_id] = lyrics;

  return res.status(200).json({
    track_name: track.track_name,
    artist_name: track.artist_name,
    lyrics: lyrics,
    track_id: track.track_id
  })
}

const home = (req, res) => {
  const instruction = [{
    route: "/get_first_song?",
    parameter: {
      user_id: "Number",
      category: "String"
    },
    return: {
      track_id: "Number",
      track_name: "String",
      artist_name: "String",
      lyric: "String"
    },
    usage: "used for getting the first song."
  },
  {
    route: "/get_next_song?",
    parameter: {
      user_id: "Number",
      track_id: "Number"
    },
    return: {
      track_id: "Number",
      track_name: "String",
      artist_name: "String",
      lyric: "String"
    },
    usage: "used for getting the next song with the track_id of the current song."
  }];
  res.status(200).json(instruction);
}

const getFirstSong = async (req, res) => {
  const userId = req.query.user_id;
  const category = req.query.category;
  if (userId === undefined) {
    return res.status(400).send({error: "user_id parameter is required."});
  }

  if (isNaN(userId)) {
    return res.status(400).send({error: "user_id parameter should be a number."});
  }

  if (category === undefined) {
    return res.status(400).send({error: "category parameter is required."});
  }
  history[userId] = [];
  return await getSong(res, userId, category);
}


const getNextSong = async (req, res) => {
  const userId = req.query.user_id;
  const trackId = req.query.track_id;

  if (userId === undefined) {
    return res.status(400).send({
      error: "userId parameter is required.",
    });
  }

  if (isNaN(userId)) {
    return res.status(400).send({error: "user_id parameter should be a number."});
  }

  if (trackId === undefined) {
    return res.status(400).send({error: "track_id parameter is required",});
  }

  if (isNaN(trackId)) {
    return res.status(400).send({error: "user_id parameter should be a number."});
  }

  if (history[userId] === undefined || history[userId].length === 0) {
    return res.status(400).send({error: "user_id has not requested the first song."});
  }

  let lyrics;
  if (lyricsHistory[trackId] !== undefined) {
    lyrics = lyricsHistory[trackId];
  }
  else {
    const lyricsSearchURL = `track.lyrics.get?format=json&track_id=${trackId}&apikey=${apiKey}`;
    let lyricsResult;
    try {
      lyricsResult = await callGetURL(lyricsSearchURL);
    }
    catch (err) {
      return res.status(err.status).json(err.message);
    }

    lyrics = lyricsResult.data.message.body.lyrics.lyrics_body;
  }
  let wordList = lyrics.match(/\b(\w+)\b/g);
  wordList = wordList.slice(0, wordList.length - 8);
  shuffle(wordList);
  const lyricsQuery = wordList.slice(0, 5).join(' ');

  return await getSong(res, userId, lyricsQuery);
}

const getHistory = (req, res) => {
  res.status(200).json({history: history, lyrics_history: lyricsHistory});
}

module.exports = {
  home,
  getHistory,
  getFirstSong,
  getNextSong,
}
