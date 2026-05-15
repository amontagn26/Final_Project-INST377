let ratingChart = null;

async function loadshow() {
  const query = document.getElementById('show').value;

  try {
    // First fetch - search for show
    const searchRes = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
    const searchData = await searchRes.json();

    if (searchData.length === 0) {
      document.getElementById('showinfo').innerHTML = 'No results found';
      return;
    }

    const show = searchData[0].show;
    const showId = show.id;
    document.getElementById('showid').innerHTML = showId;

    // Second fetch - get show details with episodes
    const showRes = await fetch(`https://api.tvmaze.com/shows/${showId}?embed=episodes`);
    const showData = await showRes.json();

    const title = showData.name;
    const avg_rating = showData.rating.average ?? "N/A";
    const episodes = showData._embedded.episodes;

    let html = `Show Name: ${title} - Rating: ${avg_rating}<br><br>`;
    html += `<b>Episodes:</b><br>`;
    episodes.slice(0, 10).forEach(ep => {
      html += `S${ep.season}E${ep.number}: ${ep.name}<br>`;
    });
    document.getElementById('showinfo').innerHTML = html;

    // Filter episodes that have a rating
    const ratedEpisodes = episodes.filter(ep => ep.rating?.average !== null);
    const labels = ratedEpisodes.map(ep => `S${ep.season}E${ep.number}`);
    const ratings = ratedEpisodes.map(ep => ep.rating.average);

    // Destroy previous chart if it exists
    if (ratingChart) {
      ratingChart.destroy();
    }

    const ctx = document.getElementById('ratingChart').getContext('2d');
    ratingChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${title} — Episode Ratings`,
          data: ratings,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.3,
          fill: true,
        }]
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 10,
            title: { display: true, text: 'Rating' }
          },
          x: {
            title: { display: true, text: 'Episode' },
            ticks: { maxTicksLimit: 20 }
          }
        }
      }
    });

  } catch (err) {
    console.error(err);
    document.getElementById('showinfo').innerHTML = "Error loading show.";
  }
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