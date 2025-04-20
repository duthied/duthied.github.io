// DOM Elements
const itemList = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const itemCount = document.getElementById('movie-count');
const searchStats = document.getElementById('search-stats');

// Global variables
let allItems = [];

// Load both movies and series data
function loadData() {
    // Use Promise.all to fetch both data files simultaneously
    Promise.all([
        fetch('movies.json').then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        }),
        fetch('series.json').then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
    ])
    .then(([moviesData, seriesData]) => {
        // Process and combine the data
        processData(moviesData, seriesData);
    })
    .catch(error => {
        console.error('Error loading data:', error);
        // Show error message to user
        itemList.innerHTML = `
            <li id="no-results">
                <p>Error loading data. Please try again later.</p>
                <p class="error-details">Note: This page needs to be served from a web server to work properly.</p>
                <p class="error-details">When deployed to GitHub Pages, it will work correctly.</p>
            </li>
        `;
        searchStats.textContent = 'Error loading data';
    });
}

// Process the combined data
function processData(moviesData, seriesData) {
    // Create objects with type information
    const movies = moviesData.Title.map(title => ({ 
        title, 
        type: 'movie' 
    }));
    
    const series = seriesData.Series.map(title => {
        // Parse series title and season
        let seriesTitle = title;
        let seasonInfo = '';
        
        if (title.includes('|')) {
            const parts = title.split('|');
            seriesTitle = parts[0].trim();
            seasonInfo = parts[1].trim();
        }
        
        return {
            title,
            displayTitle: seriesTitle,
            seasonInfo: seasonInfo,
            type: 'series'
        };
    });
    
    // Combine and sort alphabetically
    allItems = [...movies, ...series].sort((a, b) => {
        // For series, sort by the display title (without season info)
        const titleA = a.type === 'series' ? a.displayTitle : a.title;
        const titleB = b.type === 'series' ? b.displayTitle : b.title;
        return titleA.localeCompare(titleB);
    });
    
    // Remove duplicates if any (unlikely with the type property)
    allItems = allItems.filter((item, index, self) => 
        index === self.findIndex(t => t.title === item.title)
    );
    
    // Display all items
    displayItems(allItems);
    
    // Initialize search functionality
    initSearch();
}

// Display items in the list
function displayItems(items) {
    // Clear the current list
    itemList.innerHTML = '';
    
    // Update item count
    itemCount.textContent = items.length;
    
    if (items.length === 0) {
        // Show no results message
        itemList.innerHTML = `<li id="no-results">No items found matching your search.</li>`;
        searchStats.textContent = 'No items found';
    } else {
        // Create and append items
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = `item ${item.type}-item`;
            
            // Different icons for movies vs series
            const icon = item.type === 'movie' ? '🎬' : '📺';
            
            // For series, extract and display season info
            let seasonInfoHTML = '';
            if (item.type === 'series' && item.seasonInfo) {
                seasonInfoHTML = `<span class="series-info">${item.seasonInfo}</span>`;
            }
            
            // Create the item content
            li.innerHTML = `
                <span class="icon">${icon}</span>
                <div class="item-content">
                    <div class="item-title">${item.type === 'series' ? item.displayTitle : item.title}</div>
                    ${seasonInfoHTML}
                </div>
                <span class="type-label ${item.type}-label">${item.type}</span>
            `;
            
            itemList.appendChild(li);
        });
        
        // Update search stats
        if (items.length === allItems.length) {
            searchStats.textContent = `Showing all ${items.length} items`;
        } else {
            searchStats.textContent = `Showing ${items.length} of ${allItems.length} items`;
        }
    }
}

// Initialize search functionality
function initSearch() {
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            // If search is empty, show all items
            displayItems(allItems);
        } else {
            // Filter items based on search term
            const filteredItems = allItems.filter(item => 
                item.title.toLowerCase().includes(searchTerm)
            );
            
            // Display filtered items
            displayItems(filteredItems);
        }
    });
    
    // Focus search input on page load
    searchInput.focus();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', loadData);
