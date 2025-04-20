// DOM Elements
const movieList = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const movieCount = document.getElementById('movie-count');
const searchStats = document.getElementById('search-stats');

// Global variables
let allMovies = [];

// Load movies data from JSON file
function loadMovies() {
    // Use fetch API to load the movies.json file
    // This will work when deployed to GitHub Pages
    fetch('movies.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Process the movie data
            processMovieData(data);
        })
        .catch(error => {
            console.error('Error loading movies:', error);
            // Show error message to user
            movieList.innerHTML = `
                <li id="no-results">
                    <p>Error loading movies. Please try again later.</p>
                    <p class="error-details">Note: This page needs to be served from a web server to work properly.</p>
                    <p class="error-details">When deployed to GitHub Pages, it will work correctly.</p>
                </li>
            `;
            searchStats.textContent = 'Error loading movies';
        });
}

// Process the movie data once loaded
function processMovieData(data) {
    // Extract movie titles and sort alphabetically
    allMovies = data.Title.sort((a, b) => a.localeCompare(b));
    
    // Remove duplicates (if any)
    allMovies = [...new Set(allMovies)];
    
    // Display all movies
    displayMovies(allMovies);
    
    // Initialize search functionality
    initSearch();
}

// Display movies in the list
function displayMovies(movies) {
    // Clear the current list
    movieList.innerHTML = '';
    
    // Update movie count
    movieCount.textContent = movies.length;
    
    if (movies.length === 0) {
        // Show no results message
        movieList.innerHTML = `<li id="no-results">No movies found matching your search.</li>`;
        searchStats.textContent = 'No movies found';
    } else {
        // Create and append movie items
        movies.forEach(movie => {
            const li = document.createElement('li');
            li.className = 'movie-item';
            li.textContent = movie;
            movieList.appendChild(li);
        });
        
        // Update search stats
        if (movies.length === allMovies.length) {
            searchStats.textContent = `Showing all ${movies.length} movies`;
        } else {
            searchStats.textContent = `Showing ${movies.length} of ${allMovies.length} movies`;
        }
    }
}

// Initialize search functionality
function initSearch() {
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            // If search is empty, show all movies
            displayMovies(allMovies);
        } else {
            // Filter movies based on search term
            const filteredMovies = allMovies.filter(movie => 
                movie.toLowerCase().includes(searchTerm)
            );
            
            // Display filtered movies
            displayMovies(filteredMovies);
        }
    });
    
    // Focus search input on page load
    searchInput.focus();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', loadMovies);
