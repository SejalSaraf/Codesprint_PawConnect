// DOM Elements
const feedbackForm = document.getElementById("feedbackForm")
const feedbackList = document.getElementById("feedbackList")
const searchFeedback = document.getElementById("searchFeedback")
const ratingFilter = document.getElementById("ratingFilter")
const categoryFilter = document.getElementById("categoryFilter")
const alertContainer = document.getElementById("alertContainer")
const prevPageBtn = document.getElementById("prevPage")
const nextPageBtn = document.getElementById("nextPage")
const pageInfo = document.getElementById("pageInfo")

// API URL
const API_URL = "http://localhost:3000/api"

// State
let feedbackData = []
let currentPage = 1
const itemsPerPage = 5

// Event Listeners
document.addEventListener("DOMContentLoaded", loadFeedback)
feedbackForm.addEventListener("submit", handleSubmitFeedback)
searchFeedback.addEventListener("input", filterFeedback)
ratingFilter.addEventListener("change", filterFeedback)
categoryFilter.addEventListener("change", filterFeedback)
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--
    renderFeedback()
  }
})
nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage)
  if (currentPage < totalPages) {
    currentPage++
    renderFeedback()
  }
})

// Functions
async function loadFeedback() {
  try {
    const response = await fetch(`${API_URL}/feedback`)
    if (!response.ok) throw new Error("Failed to fetch feedback")

    feedbackData = await response.json()
    renderFeedback()
  } catch (error) {
    showAlert(error.message, "danger")
  }
}

function getFilteredData() {
  let filteredData = [...feedbackData]

  // Apply search filter
  if (searchFeedback.value) {
    const searchTerm = searchFeedback.value.toLowerCase()
    filteredData = filteredData.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.message && item.message.toLowerCase().includes(searchTerm)),
    )
  }

  // Apply rating filter
  if (ratingFilter.value) {
    filteredData = filteredData.filter((item) => item.rating === Number.parseInt(ratingFilter.value))
  }

  // Apply category filter
  if (categoryFilter.value) {
    filteredData = filteredData.filter((item) => item.category === categoryFilter.value)
  }

  return filteredData
}

function renderFeedback() {
  feedbackList.innerHTML = ""

  const filteredData = getFilteredData()
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Update pagination info
  pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`
  prevPageBtn.disabled = currentPage <= 1
  nextPageBtn.disabled = currentPage >= totalPages || totalPages === 0

  if (filteredData.length === 0) {
    feedbackList.innerHTML = `
      <div class="no-feedback">
        <p>No feedback found</p>
      </div>
    `
    return
  }

  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredData.slice(startIndex, endIndex)

  currentItems.forEach((item, index) => {
    const feedbackItem = document.createElement("div")
    feedbackItem.className = "feedback-item"
    feedbackItem.style.animationDelay = `${index * 0.1}s`

    const date = new Date(item.submitted_on)
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    feedbackItem.innerHTML = `
      <div class="feedback-item-header">
        <div class="feedback-name">${item.name || "Anonymous"}</div>
        <div class="feedback-category">${item.category || "General"}</div>
      </div>
      <div class="feedback-date">${formattedDate}</div>
      <div class="feedback-rating">
        ${renderStars(item.rating)}
      </div>
      <div class="feedback-message">
        ${item.message}
      </div>
    `

    feedbackList.appendChild(feedbackItem)
  })
}

function renderStars(rating) {
  let stars = ""
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += "★"
    } else {
      stars += "☆"
    }
  }
  return stars
}

async function handleSubmitFeedback(e) {
  e.preventDefault()

  const ratingInput = document.querySelector('input[name="rating"]:checked')

  if (!ratingInput) {
    showAlert("Please select a rating", "warning")
    return
  }

  const feedback = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    category: document.getElementById("category").value,
    message: document.getElementById("message").value,
    rating: Number.parseInt(ratingInput.value),
    submitted_on: new Date().toISOString(),
  }

  try {
    const response = await fetch(`${API_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    })

    if (!response.ok) throw new Error("Failed to submit feedback")

    showAlert("Thank you for your feedback!", "success")
    feedbackForm.reset()

    // Add the new feedback to the data and refresh
    const newFeedback = await response.json()
    feedbackData.unshift(newFeedback)
    currentPage = 1 // Reset to first page
    renderFeedback()
  } catch (error) {
    showAlert(error.message, "danger")
  }
}

function filterFeedback() {
  currentPage = 1 // Reset to first page when filtering
  renderFeedback()
}

function showAlert(message, type) {
  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.textContent = message

  alertContainer.appendChild(alert)

  setTimeout(() => {
    alert.remove()
  }, 5000)
}
