let ratingChart = null;

async function loadshow() {
  const query = document.getElementById('show').value;
  try {
    const searchRes = await fetch(`/shows/search?q=${encodeURIComponent(query)}`);
    const searchData = await searchRes.json();
    if (!searchRes.ok) {
      document.getElementById('showinfo').innerHTML = searchData.message;
      return;
    }
    const showId = searchData.id;

    const showRes = await fetch(`/shows/${showId}`);
    const showData = await showRes.json();

    const title = showData.name;
    const avg_rating = showData.rating ?? "N/A";   // backend already extracted this
    const episodes = showData.episodes;             // backend already extracted this
    const ratedEpisodes = showData.ratedEpisodes;  // backend already filtered this

    let html = `Show Name: ${title} - Rating: ${avg_rating}<br><br>`;
    html += `<b>Episodes:</b><br>`;
    episodes.forEach(ep => {
      html += `S${ep.season}E${ep.number}: ${ep.name}<br>`;
    });
    document.getElementById('showinfo').innerHTML = html;

    const labels = ratedEpisodes.map(ep => ep.label);
    const ratings = ratedEpisodes.map(ep => ep.rating);

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
          y: { min: 0, max: 10, title: { display: true, text: 'Rating' } },
          x: { title: { display: true, text: 'Episode' }, ticks: { maxTicksLimit: 20 } }
        }
      }
    });
  } catch (err) {
    console.error(err);
    document.getElementById('showinfo').innerHTML = "Error loading show.";
  }
}

function loadlist() {
  fetch('/shows/top')
    .then(res => res.json())
    .then(data => {
      const showList = document.getElementById('showlist');
      const content = data.map(show => {
        return `Show Name: ${show.name} - Rating: ${show.rating}`;  // backend already sorted/filtered
      }).join('<br>');
      showList.innerHTML = content;
    })
    .catch(err => {
      console.error("Error loading shows:", err);
      document.getElementById('showlist').innerHTML = "Failed to load shows.";
    });
}

window.onload = loadlist;