# README
## TV Show Explorer 
### Project Description
TV Show Explorer is a web application that allows users to search for TV shows, 
view detailed information such as episode ratings, and save their favorite shows 
to a personal list. The app pulls live data from the TVMaze API and stores users
favorite shows using a Supabase database. 

### Target Browsers
This project is intended for web browsers :
- Google Chrome
- Safari
Mobile browsers are not offically supported currently. The layout is not optimized for smaller screens. 
## Link to Developer Manual
[Click here to view the Developer Manual](#developer-manual)

---

# Developer Manual
## Audience
This manual is intended for future developers to continue development for the 
TV Show Explorer application. Developers are expected to be familiar with JavaScript, 
Node.js, Express, and REST APIs. 
## Installation
### Necessary Software
Ensure the following is installed on your device:
- Node.js (V.18+)
- npm (Included with Node.js)
- A Supabase account with a project set up
### Steps
1) Clone the Repository
git clone https://github.com/amontagn26/Final_Project-INST377.git
cd Final_Project-INST377
2) Install Dependencies
npm install
3) Create .env file in the root directory with Supabase credentials :
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_service_role_key
4) Set up Supabase database by creating a *favorites* table with the following
columns:
id | int8
show_id | int8
show_name | text
rating | float
IMPORTANT: Ensure RLS(Row Level Security) is disabled on the *favorites* table.
## How to Run
Run the application in terminal with :
node index.js



## Testing
There are no automatted tests currently written for the application. Users must
 test manually:
 1) Start the server with *node index.js*
 2) Visit *http://localhost:3000 in your browser
 3) Test each feature manually (Search for show/ add show to favorites)
## API Endpoints
### GET/
Serves the main project-page.html
### GET/shows/search?q={query}
Searches TVMaze for a show by name and returns the top match
### GET/shows/:id
Fetches full details for show by its TVMaze ID (Episode ratings, top episode, 
worst episode, description)
#### Response
{
  "id": 169,
  "name": "Breaking Bad"
}
#### Response
{
  "id": 169,
  "name": "Breaking Bad",
  "rating": 9.2,
  "genres": "Drama, Crime",
  "description": "A chemistry teacher diagnosed with cancer...",
  "topEpisode": { "label": "S5E16", "name": "Felina", "rating": 9.9 },
  "worstEpisode": { "label": "S1E1", "name": "Pilot", "rating": 7.9 },
  "ratedEpisodes": [...]
}
### GET/favorites
Retrives all saved favorite shows from Supabase database
#### Response
[
  {
    "id": 1,
    "show_id": 169,
    "show_name": "Breaking Bad",
    "rating": 9.2
  }
]
### POST/favorites
Saves a show to the Supabase database
#### Request Body :
{
  "show_id": 169,
  "show_name": "Breaking Bad",
  "rating": 9.2
}
#### Response :
[
  {
    "id": 1,
    "show_id": 169,
    "show_name": "Breaking Bad",
    "rating": 9.2
  }
]
## Bugs
### Known Bugs
- The same show can be added to favorites multiple times
- Ratings chart will not render correctly if a show is missing episode ratings
## Roadmap for future development
- Add a duplicate check before inserting into favorites table
- Add user authentication to provide a unique favorites list for each user
- Add a show poster image to the show info section
- Write automated tests

