const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const app = express();
const port = 3000;

dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const TVMAZE_BASE = 'https://api.tvmaze.com';

app.get('/', (req, res) => {
  res.sendFile('public/project-page.html', { root: __dirname });
});

app.get('/shows/top', async (req, res) => {
  console.log('Fetching top-rated shows from TVMaze');
  try {
    const response = await fetch(`${TVMAZE_BASE}/shows`);
    if (!response.ok) {
      console.log(`TVMaze error: ${response.status}`);
      res.statusCode = 502;
      return res.json({ message: 'Failed to fetch shows from TVMaze' });
    }
    const data = await response.json();
    const topShows = data
      .filter(show => show.rating.average !== null)
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(0, 25)
      .map(show => ({
        id: show.id,
        name: show.name,
        rating: show.rating.average,
        genres: show.genres,
        image: show.image?.medium ?? null,
      }));
    console.log(`Returning ${topShows.length} top-rated shows`);
    res.json(topShows);
  } catch (err) {
    console.log(`Error: ${err}`);
    res.statusCode = 500;
    res.json({ message: 'Internal server error' });
  }
});


app.get('/shows/search', async (req, res) => {
  const query = req.query.q;
  console.log(`Searching for show: ${query}`);
  if (!query || query.trim() === '') {
    res.statusCode = 400;
    return res.json({ message: 'Query parameter "q" is required' });
  }
  try {
    const response = await fetch(`${TVMAZE_BASE}/search/shows?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      console.log(`TVMaze error: ${response.status}`);
      res.statusCode = 502;
      return res.json({ message: 'Failed to search TVMaze' });
    }
    const data = await response.json();
    if (data.length === 0) {
      res.statusCode = 404;
      return res.json({ message: `No results found for "${query}"` });
    }
    
    const topMatch = data[0].show;
    console.log(`Top match: ${topMatch.name} (id: ${topMatch.id})`);
    res.json({ id: topMatch.id, name: topMatch.name });
  } catch (err) {
    console.log(`Error: ${err}`);
    res.statusCode = 500;
    res.json({ message: 'Internal server error' });
  }
});


app.get('/shows/:id', async (req, res) => {
  const showId = req.params.id;
  console.log(`Fetching show details for id: ${showId}`);
  if (isNaN(showId)) {
    res.statusCode = 400;
    return res.json({ message: 'Show ID must be a number' });
  }
  try {
    const response = await fetch(`${TVMAZE_BASE}/shows/${showId}?embed=episodes`);
    if (!response.ok) {
      if (response.status === 404) {
        res.statusCode = 404;
        return res.json({ message: `Show with id ${showId} not found` });
      }
      console.log(`TVMaze error: ${response.status}`);
      res.statusCode = 502;
      return res.json({ message: 'Failed to fetch show from TVMaze' });
    }
    const showData = await response.json();
    const episodes = showData._embedded.episodes;
    const ratedEpisodes = episodes
      .filter(ep => ep.rating?.average !== null)
      .map(ep => ({
        season: ep.season,
        number: ep.number,
        name: ep.name,
        rating: ep.rating.average,
        label: `S${ep.season}E${ep.number}`,
      }));
    const result = {
      id: showData.id,
      name: showData.name,
      rating: showData.rating.average ?? 'N/A',
      episodes: episodes.slice(0, 10).map(ep => ({
        season: ep.season,
        number: ep.number,
        name: ep.name,
        label: `S${ep.season}E${ep.number}`,
      })),
      ratedEpisodes,
    };
    console.log(`Returning details for: ${result.name}`);
    res.json(result);
  } catch (err) {
    console.log(`Error: ${err}`);
    res.statusCode = 500;
    res.json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`App is available on port: ${port}`);
});