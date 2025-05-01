import { Chart } from "@/components/ui/chart"
// DOM Elements
const totalItemsEl = document.getElementById("totalItems")
const lowStockItemsEl = document.getElementById("lowStockItems")
const totalQuantityEl = document.getElementById("totalQuantity")
const totalFeedbackEl = document.getElementById("totalFeedback")
const avgRatingEl = document.getElementById("avgRating")
const positiveFeedbackEl = document.getElementById("positiveFeedback")
const lowStockTableEl = document.getElementById("lowStockTable").querySelector("tbody")
const recentFeedbackEl = document.getElementById("recentFeedback")
const alertContainer = document.getElementById("alertContainer")

// Charts
let categoryChart
let ratingChart

// API URL
const API_URL = "http://localhost:3000/api"

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData()
})

// Functions
async function loadDashboardData() {
  try {
    // Load inventory data
    const inventoryResponse = await fetch(`${API_URL}/inventory`)
    if (!inventoryResponse.ok) throw new Error("Failed to fetch inventory")
    const inventoryData = await inventoryResponse.json()

    // Load low stock items
    const lowStockResponse = await fetch(`${API_URL}/inventory-low-stock`)
    if (!lowStockResponse.ok) throw new Error("Failed to fetch low stock items")
    const lowStockData = await lowStockResponse.json()

    // Load inventory by category
    const categoryResponse = await fetch(`${API_URL}/inventory-category`)
    if (!categoryResponse.ok) throw new Error("Failed to fetch inventory by category")
    const categoryData = await categoryResponse.json()

    // Load feedback data
    const feedbackResponse = await fetch(`${API_URL}/feedback`)
    if (!feedbackResponse.ok) throw new Error("Failed to fetch feedback")
    const feedbackData = await feedbackResponse.json()

    // Load feedback analytics
    const analyticsResponse = await fetch(`${API_URL}/feedback/analytics`)
    if (!analyticsResponse.ok) throw new Error("Failed to fetch feedback analytics")
    const analyticsData = await analyticsResponse.json()

    // Update UI
    updateInventorySummary(inventoryData)
    updateLowStockTable(lowStockData)
    updateFeedbackSummary(analyticsData)
    updateRecentFeedback(feedbackData)
    createCategoryChart(categoryData)
    createRatingChart(feedbackData)
  } catch (error) {
    showAlert(error.message, "danger")
  }
}

function updateInventorySummary(inventoryData) {
  const totalItems = inventoryData.length
  const lowStockItems = inventoryData.filter((item) => item.quantity <= item.low_stock_threshold).length
  const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity, 0)

  totalItemsEl.textContent = totalItems
  lowStockItemsEl.textContent = lowStockItems
  totalQuantityEl.textContent = totalQuantity

  // Add animation
  animateValue(totalItemsEl, 0, totalItems, 1000)
  animateValue(lowStockItemsEl, 0, lowStockItems, 1000)
  animateValue(totalQuantityEl, 0, totalQuantity, 1000)
}

function updateLowStockTable(lowStockData) {
  lowStockTableEl.innerHTML = ""

  if (lowStockData.length === 0) {
    lowStockTableEl.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No low stock items</td>
      </tr>
    `
    return
  }

  lowStockData.forEach((item) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${item.item_name}</td>
      <td>${item.category}</td>
      <td>${item.quantity}</td>
      <td>${item.low_stock_threshold}</td>
      <td>
        <button class="btn btn-primary" onclick="window.location.href='inventory.html?id=${item.id}'">Update Stock</button>
      </td>
    `
    lowStockTableEl.appendChild(row)
  })
}

function updateFeedbackSummary(analyticsData) {
  const totalFeedback = analyticsData.total_feedback || 0
  const avgRating = (analyticsData.average_rating || 0).toFixed(1)
  const positiveFeedback = analyticsData.positive_feedback || 0

  // Add animation
  animateValue(totalFeedbackEl, 0, totalFeedback, 1000)
  animateValue(avgRatingEl, 0, avgRating, 1000, 1)
  animateValue(positiveFeedbackEl, 0, positiveFeedback, 1000)
}

function updateRecentFeedback(feedbackData) {
  recentFeedbackEl.innerHTML = ""

  if (feedbackData.length === 0) {
    recentFeedbackEl.innerHTML = `
      <div class="no-feedback">
        <p>No feedback available</p>
      </div>
    `
    return
  }

  // Show only the 5 most recent feedback
  const recentFeedback = feedbackData.slice(0, 5)

  recentFeedback.forEach((item, index) => {
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
      <div class="feedback-header">
        <div class="feedback-name">${item.name || "Anonymous"}</div>
        <div class="feedback-category">${item.category || "General"}</div>
        <div class="feedback-date">${formattedDate}</div>
      </div>
      <div class="feedback-rating">
        ${renderStars(item.rating)}
      </div>
      <div class="feedback-message">
        ${item.message}
      </div>
    `

    recentFeedbackEl.appendChild(feedbackItem)
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

function createCategoryChart(categoryData) {
  const ctx = document.getElementById("categoryChart").getContext("2d")

  // Destroy existing chart if it exists
  if (categoryChart) {
    categoryChart.destroy()
  }

  const labels = categoryData.map((item) => item.category)
  const itemCounts = categoryData.map((item) => item.item_count)
  const quantities = categoryData.map((item) => item.total_quantity)

  categoryChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Item Count",
          data: itemCounts,
          backgroundColor: "rgba(76, 175, 80, 0.6)",
          borderColor: "rgba(76, 175, 80, 1)",
          borderWidth: 1,
        },
        {
          label: "Total Quantity",
          data: quantities,
          backgroundColor: "rgba(243, 156, 18, 0.6)",
          borderColor: "rgba(243, 156, 18, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      animation: {
        duration: 1500,
        easing: "easeOutQuart",
      },
    },
  })
}

function createRatingChart(feedbackData) {
  const ctx = document.getElementById("ratingChart").getContext("2d")

  // Destroy existing chart if it exists
  if (ratingChart) {
    ratingChart.destroy()
  }

  // Count ratings
  const ratings = [0, 0, 0, 0, 0] // 1-5 stars

  feedbackData.forEach((item) => {
    if (item.rating >= 1 && item.rating <= 5) {
      ratings[item.rating - 1]++
    }
  })

  ratingChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
      datasets: [
        {
          data: ratings,
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(255, 205, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
          ],
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(255, 159, 64)",
            "rgb(255, 205, 86)",
            "rgb(75, 192, 192)",
            "rgb(54, 162, 235)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
        },
      },
      animation: {
        duration: 1500,
        easing: "easeOutQuart",
      },
    },
  })
}

function animateValue(element, start, end, duration, decimals = 0) {
  let startTimestamp = null
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp
    const progress = Math.min((timestamp - startTimestamp) / duration, 1)
    const value = progress * (end - start) + start
    element.textContent = Number(value).toFixed(decimals)
    if (progress < 1) {
      window.requestAnimationFrame(step)
    }
  }
  window.requestAnimationFrame(step)
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
