// DOM Elements
const inventoryForm = document.getElementById("inventoryForm")
const itemIdInput = document.getElementById("itemId")
const itemNameInput = document.getElementById("itemName")
const categoryInput = document.getElementById("category")
const quantityInput = document.getElementById("quantity")
const unitInput = document.getElementById("unit")
const lowStockThresholdInput = document.getElementById("lowStockThreshold")
const notesInput = document.getElementById("notes")
const saveBtn = document.getElementById("saveBtn")
const cancelBtn = document.getElementById("cancelBtn")
const inventoryTableBody = document.getElementById("inventoryTable").querySelector("tbody")
const searchInventory = document.getElementById("searchInventory")
const categoryFilter = document.getElementById("categoryFilter")
const stockFilter = document.getElementById("stockFilter")
const alertContainer = document.getElementById("alertContainer")
const prevPageBtn = document.getElementById("prevPage")
const nextPageBtn = document.getElementById("nextPage")
const pageInfo = document.getElementById("pageInfo")

// API URL
const API_URL = "http://localhost:3000/api"

// State
let inventoryData = []
let currentPage = 1
const itemsPerPage = 10
let isEditing = false

// Event Listeners
document.addEventListener("DOMContentLoaded", loadInventory)
inventoryForm.addEventListener("submit", handleSubmitInventory)
cancelBtn.addEventListener("click", resetForm)
searchInventory.addEventListener("input", filterInventory)
categoryFilter.addEventListener("change", filterInventory)
stockFilter.addEventListener("change", filterInventory)
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--
    renderInventory()
  }
})
nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage)
  if (currentPage < totalPages) {
    currentPage++
    renderInventory()
  }
})

// Check URL for item ID
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search)
  const itemId = urlParams.get("id")

  if (itemId) {
    loadItemForEdit(itemId)
  }
})

// Functions
async function loadInventory() {
  try {
    const response = await fetch(`${API_URL}/inventory`)
    if (!response.ok) throw new Error("Failed to fetch inventory")

    inventoryData = await response.json()
    renderInventory()
  } catch (error) {
    showAlert(error.message, "danger")
  }
}

function getFilteredData() {
  let filteredData = [...inventoryData]

  // Apply search filter
  if (searchInventory.value) {
    const searchTerm = searchInventory.value.toLowerCase()
    filteredData = filteredData.filter(
      (item) =>
        item.item_name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm)),
    )
  }

  // Apply category filter
  if (categoryFilter.value) {
    filteredData = filteredData.filter((item) => item.category === categoryFilter.value)
  }

  // Apply stock filter
  if (stockFilter.value === "low") {
    filteredData = filteredData.filter((item) => item.quantity <= item.low_stock_threshold)
  } else if (stockFilter.value === "normal") {
    filteredData = filteredData.filter((item) => item.quantity > item.low_stock_threshold)
  }

  return filteredData
}

function renderInventory() {
  inventoryTableBody.innerHTML = ""

  const filteredData = getFilteredData()
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Update pagination info
  pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`
  prevPageBtn.disabled = currentPage <= 1
  nextPageBtn.disabled = currentPage >= totalPages || totalPages === 0

  if (filteredData.length === 0) {
    inventoryTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">No inventory items found</td>
      </tr>
    `
    return
  }

  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredData.slice(startIndex, endIndex)

  currentItems.forEach((item) => {
    const row = document.createElement("tr")

    // Determine status
    let statusClass = "status-normal"
    let statusText = "Normal"

    if (item.quantity === 0) {
      statusClass = "status-out"
      statusText = "Out of Stock"
    } else if (item.quantity <= item.low_stock_threshold) {
      statusClass = "status-low"
      statusText = "Low Stock"
    }

    row.innerHTML = `
      <td>${item.item_name}</td>
      <td>${item.category}</td>
      <td>${item.quantity} ${item.unit}</td>
      <td>${item.unit}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td class="action-buttons">
        <button class="btn action-btn btn-primary" onclick="loadItemForEdit(${item.id})">Edit</button>
        <button class="btn action-btn btn-danger" onclick="deleteItem(${item.id})">Delete</button>
      </td>
    `

    inventoryTableBody.appendChild(row)
  })
}

async function loadItemForEdit(itemId) {
  try {
    const response = await fetch(`${API_URL}/inventory/${itemId}`)
    if (!response.ok) throw new Error("Failed to fetch item")

    const item = await response.json()

    // Populate form
    itemIdInput.value = item.id
    itemNameInput.value = item.item_name
    categoryInput.value = item.category
    quantityInput.value = item.quantity
    unitInput.value = item.unit
    lowStockThresholdInput.value = item.low_stock_threshold
    notesInput.value = item.notes || ""

    // Update UI
    saveBtn.textContent = "Update Item"
    isEditing = true

    // Scroll to form
    document.querySelector(".form-container").scrollIntoView({ behavior: "smooth" })
  } catch (error) {
    showAlert(error.message, "danger")
  }
}

async function handleSubmitInventory(e) {
  e.preventDefault()

  const item = {
    item_name: itemNameInput.value,
    category: categoryInput.value,
    quantity: Number.parseInt(quantityInput.value),
    unit: unitInput.value,
    low_stock_threshold: Number.parseInt(lowStockThresholdInput.value),
    notes: notesInput.value,
  }

  try {
    let response
    let successMessage

    if (isEditing) {
      // Update existing item
      item.id = Number.parseInt(itemIdInput.value)
      response = await fetch(`${API_URL}/inventory/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
      successMessage = "Item updated successfully!"
    } else {
      // Create new item
      response = await fetch(`${API_URL}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
      successMessage = "Item added successfully!"
    }

    if (!response.ok) throw new Error(isEditing ? "Failed to update item" : "Failed to add item")

    showAlert(successMessage, "success")
    resetForm()
    loadInventory()
  } catch (error) {
    showAlert(error.message, "danger")
  }
}

async function deleteItem(itemId) {
  if (!confirm("Are you sure you want to delete this item?")) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/inventory/${itemId}`, {
      method: "DELETE",
    })

    if (!response.ok) throw new Error("Failed to delete item")

    showAlert("Item deleted successfully!", "success")
    loadInventory()
  } catch (error) {
    showAlert(error.message, "danger")
  }
}

function resetForm() {
  inventoryForm.reset()
  itemIdInput.value = ""
  saveBtn.textContent = "Save Item"
  isEditing = false
}

function filterInventory() {
  currentPage = 1 // Reset to first page when filtering
  renderInventory()
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
