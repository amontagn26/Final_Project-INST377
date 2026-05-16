const express = require('express');
const dotenv = require('dotenv');
const supabaseClient = require('@supabase/supabase-js');

const app = express();
const port = 3000;

dotenv.config();

app.use(express.json());
app.use(express.static(__dirname + '/public'));

const supabase = supabaseClient.createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const TVMAZE_BASE = 'https://api.tvmaze.com';

app.get('/', (req, res) => {
  res.sendFile('public/project-page.html', { root: __dirname });
});

app.get('/shows/search', async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Query parameter "q" is required' });
  }
  try {
    const response = await fetch(`${TVMAZE_BASE}/search/shows?q=${encodeURIComponent(query)}`);
    if (!response.ok) return res.status(502).json({ message: 'Failed to search TVMaze' });
    const data = await response.json();
    if (data.length === 0) return res.status(404).json({ message: `No results found for "${query}"` });
    const topMatch = data[0].show;
    console.log(`Top match: ${topMatch.name} (id: ${topMatch.id})`);
    res.json({ id: topMatch.id, name: topMatch.name });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/shows/:id', async (req, res) => {
  const showId = req.params.id;
  if (isNaN(showId)) return res.status(400).json({ message: 'Show ID must be a number' });
  try {
    const response = await fetch(`${TVMAZE_BASE}/shows/${showId}?embed=episodes`);
    if (!response.ok) {
      if (response.status === 404) return res.status(404).json({ message: `Show with id ${showId} not found` });
      return res.status(502).json({ message: 'Failed to fetch show from TVMaze' });
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
    console.log(`Returning details for: ${showData.name}`);
    res.json({
      id: showData.id,
      name: showData.name,
      rating: showData.rating.average ?? 'N/A',
      genres: showData.genres.join(', ') || 'N/A',
      description: showData.summary?.replace(/<[^>]*>/g, '') ?? 'No description available',
      topEpisode: ratedEpisodes.reduce((a, b) => a.rating > b.rating ? a : b, ratedEpisodes[0]),
      worstEpisode: ratedEpisodes.reduce((a, b) => a.rating < b.rating ? a : b, ratedEpisodes[0]),
      ratedEpisodes,
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/favorites', async (req, res) => {
  const { data, error } = await supabase.from('favorites').select();
  if (error) return res.status(500).send(error);
  console.log(`Received ${data.length} favorites`);
  res.json(data);
});

app.post('/favorites', async (req, res) => {
  const { show_id, show_name, rating } = req.body;
  if (!show_id || !show_name) return res.status(400).json({ message: 'show_id and show_name are required' });
  const { data, error } = await supabase
    .from('favorites')
    .insert({ show_id, show_name, rating })
    .select();
  if (error) return res.status(500).send(error);
  console.log(`Added to favorites: ${show_name}`);
  res.json(data);
});

app.listen(port, () => {
  console.log(`App is available on port: ${port}`);
});