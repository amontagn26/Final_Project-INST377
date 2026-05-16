let ratingChart = null;
let currentShow = null;

async function loadshow() {
  const query = document.getElementById('show').value;
  try {
    const searchRes = await fetch(`/shows/search?q=${encodeURIComponent(query)}`);
    const searchData = await searchRes.json();
    if (!searchRes.ok) {
      document.getElementById('show-info').innerHTML = searchData.message;
      return;
    }
    const showId = searchData.id;

    const showRes = await fetch(`/shows/${showId}`);
    const showData = await showRes.json();

    const title = showData.name;
    const avg_rating = showData.rating ?? 'N/A';
    const genres = showData.genres ?? 'N/A';
    const description = showData.description ?? 'N/A';
    const top = showData.topEpisode;
    const worst = showData.worstEpisode;
    const ratedEpisodes = showData.ratedEpisodes;

    let html = `
      <b>Name:</b> ${title}<br>
      <b>Genre:</b> ${genres}<br>
      <b>Rating:</b> ${avg_rating}<br>
      <b>Top Episode:</b> ${top ? `${top.label} - ${top.name} (${top.rating})` : 'N/A'}<br>
      <b>Worst Episode:</b> ${worst ? `${worst.label} - ${worst.name} (${worst.rating})` : 'N/A'}<br><br>
      <b>Description:</b><br>${description}
`     ;

    document.getElementById('show-info').innerHTML = html;

    const labels = ratedEpisodes.map(ep => ep.label);
    const ratings = ratedEpisodes.map(ep => ep.rating);

    currentShow = {
      show_id: showData.id,
      show_name: showData.name,
      rating: showData.rating
    };
    document.getElementById('fav-button').style.display = 'block';

    if (ratingChart) {
      ratingChart.destroy();
    }
    const ctx = document.getElementById('rating-chart').getContext('2d');
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
    document.getElementById('show-info').innerHTML = "Error loading show.";
  }
}


async function addFavorite() {
  if (!currentShow) return;
  try {
    const res = await fetch('/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentShow)
    });
    const data = await res.json();
    if (res.ok) {
      alert(`${currentShow.show_name} added to favorites!`);
      loadFavorites(); 
    } else {
      alert('Error adding to favorites');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

function loadFavorites() {
  fetch('/favorites')
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        console.error('Unexpected response:', data);
        return;
      }
      if ($.fn.DataTable.isDataTable('#favorites-list')) {
        $('#favorites-list').DataTable().destroy();
      }
      $('#favorites-list').DataTable({
        data: data.map(show => [show.show_name, show.rating ?? 'N/A']),
        columns: [{ title: 'Name' }, { title: 'Rating' }]
      });
    })
    .catch(err => console.error('Error loading favorites:', err));
}


window.onload = loadFavorites;



