// DOM Elements
const itemList = document.getElementById("movie-list")
const searchInput = document.getElementById("search-input")
const itemCount = document.getElementById("item-count")
const searchStats = document.getElementById("search-stats")
const themeToggle = document.getElementById("theme-toggle")
const clearSearchBtn = document.getElementById("clear-search")
const filterBtns = document.querySelectorAll(".filter-btn")
const loader = document.getElementById("loader")

// Global variables
let allItems = []
let currentFilter = "all"

// Theme management
function initTheme() {
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem("theme")

  if (savedTheme) {
    document.body.className = savedTheme
  } else {
    // Check if user prefers dark mode
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.className = "dark-mode"
    }
  }

  // Set up theme toggle
  themeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("dark-mode")) {
      document.body.className = "light-mode"
      localStorage.setItem("theme", "light-mode")
    } else {
      document.body.className = "dark-mode"
      localStorage.setItem("theme", "dark-mode")
    }
  })
}

// Search functionality
function initSearchControls() {
  // Clear search button
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = ""
    clearSearchBtn.classList.add("hidden")
    filterItems()
    searchInput.focus()
  })

  // Show/hide clear button
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() !== "") {
      clearSearchBtn.classList.remove("hidden")
    } else {
      clearSearchBtn.classList.add("hidden")
    }
    filterItems()
  })
}

// Filter buttons
function initFilterButtons() {
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"))

      // Add active class to clicked button
      btn.classList.add("active")

      // Set current filter
      currentFilter = btn.dataset.filter

      // Apply filters
      filterItems()
    })
  })
}

// Filter items based on search and type filter
function filterItems() {
  const searchTerm = searchInput.value.trim().toLowerCase()

  let filtered = allItems

  // Apply type filter first
  if (currentFilter !== "all") {
    filtered = filtered.filter((item) => item.type === currentFilter)
  }

  // Then apply search filter
  if (searchTerm !== "") {
    filtered = filtered.filter((item) => {
      // For series, search in both display title and season info
      if (item.type === "series") {
        return (
          item.displayTitle.toLowerCase().includes(searchTerm) ||
          (item.seasonInfo && item.seasonInfo.toLowerCase().includes(searchTerm))
        )
      }
      return item.title.toLowerCase().includes(searchTerm)
    })
  }

  // Display filtered items
  displayItems(filtered)
}

// Load both movies and series data
function loadData() {
  // Show loader
  loader.style.display = "flex"

  // Use Promise.all to fetch both data files simultaneously
  Promise.all([
    fetch("movies.json").then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    }),
    fetch("series.json").then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    }),
  ])
    .then(([moviesData, seriesData]) => {
      // Process and combine the data
      processData(moviesData, seriesData)
      // Hide loader
      loader.style.display = "none"
    })
    .catch((error) => {
      console.error("Error loading data:", error)
      // Show error message to user
      itemList.innerHTML = `
            <li id="no-results">
                <p>Error loading data. Please try again later.</p>
                <p class="error-details">Note: This page needs to be served from a web server to work properly.</p>
                <p class="error-details">When deployed to GitHub Pages, it will work correctly.</p>
            </li>
        `
      searchStats.textContent = "Error loading data"
      loader.style.display = "none"
    })
}

// Process the combined data
function processData(moviesData, seriesData) {
  // Create objects with type information
  const movies = moviesData.Title.map((title) => ({
    title,
    type: "movie",
  }))

  const series = seriesData.Series.map((title) => {
    // Parse series title and season
    let seriesTitle = title
    let seasonInfo = ""

    if (title.includes("|")) {
      const parts = title.split("|")
      seriesTitle = parts[0].trim()
      seasonInfo = parts[1].trim()
    }

    return {
      title,
      displayTitle: seriesTitle,
      seasonInfo: seasonInfo,
      type: "series",
    }
  })

  // Combine and sort alphabetically
  allItems = [...movies, ...series].sort((a, b) => {
    // For series, sort by the display title (without season info)
    const titleA = a.type === "series" ? a.displayTitle : a.title
    const titleB = b.type === "series" ? b.displayTitle : b.title
    return titleA.localeCompare(titleB)
  })

  // Remove duplicates if any (unlikely with the type property)
  allItems = allItems.filter((item, index, self) => index === self.findIndex((t) => t.title === item.title))

  // Display all items
  displayItems(allItems)
}

// Get a color based on the first letter of the title
function getColorForTitle(title) {
  const colors = [
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#d35400",
    "#c0392b",
    "#16a085",
    "#8e44ad",
  ]

  const firstChar = title.charAt(0).toUpperCase()
  const charCode = firstChar.charCodeAt(0)

  // Use character code to pick a color
  return colors[charCode % colors.length]
}

// Display items in the list
function displayItems(items) {
  // Clear the current list
  itemList.innerHTML = ""

  // Update item count
  itemCount.textContent = items.length

  if (items.length === 0) {
    // Show no results message
    itemList.innerHTML = `
      <li id="no-results">
        <p>🔍 No items found matching your search.</p>
        <p>Try adjusting your search or filters.</p>
      </li>
    `
    searchStats.textContent = "No items found"
  } else {
    // Create and append items with staggered animation
    items.forEach((item, index) => {
      const li = document.createElement("li")
      li.className = `item ${item.type}-item`
      li.style.animationDelay = `${index * 0.05}s`

      // Different icons for movies vs series
      const icon = item.type === "movie" ? "🎬" : "📺"

      // For series, extract and display season info
      let seasonInfoHTML = ""
      if (item.type === "series" && item.seasonInfo) {
        seasonInfoHTML = `<span class="series-info">${item.seasonInfo}</span>`
      }

      // Get the title to display
      const displayTitle = item.type === "series" ? item.displayTitle : item.title

      // Get poster color and first letter for the poster placeholder
      const posterColor = getColorForTitle(displayTitle)
      const firstLetter = displayTitle.charAt(0).toUpperCase()

      // Create the item content
      li.innerHTML = `
        <div class="poster" style="background-color: ${posterColor};">
          <span class="poster-letter">${firstLetter}</span>
        </div>
        <div class="item-content">
          <div class="item-title">${displayTitle}</div>
          ${seasonInfoHTML}
        </div>
        <span class="type-label ${item.type}-label">${item.type}</span>
      `

      itemList.appendChild(li)
    })

    // Update search stats
    if (items.length === allItems.length) {
      searchStats.textContent = `Showing all ${items.length} items`
    } else {
      searchStats.textContent = `Showing ${items.length} of ${allItems.length} items`
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initTheme()
  initSearchControls()
  initFilterButtons()
  loadData()
})
