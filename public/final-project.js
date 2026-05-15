  
 function loadshow() {
  const query = document.getElementById('show').value;

  fetch(`https://api.tvmaze.com/search/shows?q=${query}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.length === 0) {
        document.getElementById('showinfo').innerHTML = 'No results found';
        return;
      }

      const show = data[0].show;
      const showId = show.id;
      document.getElementById('showid').innerHTML = showId;

      // SECOND fetch with embed=episodes
      return fetch(`https://api.tvmaze.com/shows/${showId}?embed=episodes`);
    })
    .then(res => res.json())
    .then(data => {
      const title = data.name;
      const avg_rating = data.rating.average ?? "N/A";
      const episodes = data._embedded.episodes;

      let html = `Show Name: ${title} - Rating: ${avg_rating}<br><br>`;
      html += `<b>Episodes:</b><br>`;

      episodes.slice(0, 10).forEach(ep => {
        html += `S${ep.season}E${ep.number}: ${ep.name}<br>`;
      });

      document.getElementById('showinfo').innerHTML = html;
    })
    .catch(err => {
      console.error(err);
      document.getElementById('showinfo').innerHTML = "Error loading show.";
    });
}
function loadlist() {
  fetch('https://api.tvmaze.com/shows')
    .then(res => res.json())
    .then(data => {
      const showList = document.getElementById('showlist');

      const topShows = data
        .filter(show => show.rating.average !== null) // remove unrated
        .sort((a, b) => b.rating.average - a.rating.average) // highest first
        .slice(0, 25);

      const content = topShows.map(show => {
        return `Show Name: ${show.name} - Rating: ${show.rating.average}`;
      }).join('<br>');

      showList.innerHTML = content;
    })
    .catch(err => {
      console.error("Error loading shows:", err);
      document.getElementById('showlist').innerHTML = "Failed to load shows.";
    });
}

window.onload = loadlist;