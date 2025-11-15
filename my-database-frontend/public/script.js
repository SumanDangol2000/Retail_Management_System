

// Fetch Customer data
function loadCustomerData() {
    fetch('/.netlify/functions/customer-get-items')
        .then(response => response.json())
        .then(data => {
            createTableFromJSON(data, "customer_record")
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('customer_record').innerHTML =
                '<p style="color:red">Error loading data</p>';
        });
}

function loadSalesData() {
    fetch('/.netlify/functions/sales-get-items')
        .then(response => response.json())
        .then(data => {
            createTableFromJSON(data, "sales_record")
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('sales_record').innerHTML =
                '<p style="color:red">Error loading data</p>';
        });
}

function loadProductData() {
    fetch('/.netlify/functions/product-get-items')
        .then(response => response.json())
        .then(data => {
            createTableFromJSON(data, "product_record")
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('product_record').innerHTML =
                '<p style="color:red">Error loading data</p>';
        });
}


function loadSuppliersData() {
    fetch('/.netlify/functions/suppliers-get-items')
        .then(response => response.json())
        .then(data => {
            createTableFromJSON(data, "suppliers_record")
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('suppliers_record').innerHTML =
                '<p style="color:red">Error loading data</p>';
        });
}

export function loadCategoryData() {
    fetch('/.netlify/functions/category-get-items')
        .then(response => response.json())
        .then(data => {
            createTableFromJSON(data, "category_record")
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('category_record').innerHTML =
                '<p style="color:red">Error loading data</p>';
        });
}

// Call automatically when page loads
document.addEventListener("DOMContentLoaded", function () {
    loadCustomerData();
    loadProductData();
    loadSalesData();
    loadSuppliersData();
    loadCategoryData();
});


function createTableFromJSON(jsonData, containerId) {
    // Convert single object to array
    if (!Array.isArray(jsonData)) {
        jsonData = [jsonData];
    }

    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Clear previous content

    if (jsonData.length === 0) {
        container.innerHTML = "<p>No data available</p>";
        return;
    }

    // Create the table
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    // Extract headers
    const headers = Object.keys(jsonData[0]);
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach(key => {
        const th = document.createElement("th");
        th.innerText = key;
        th.style.border = "1px solid black";
        th.style.padding = "8px";
        th.style.background = "#f0f0f0";
        headerRow.appendChild(th);
    });

    // Add "Actions" header
    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    actionTh.style.border = "1px solid black";
    actionTh.style.padding = "8px";
    actionTh.style.background = "#f0f0f0";
    headerRow.appendChild(actionTh);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");

    jsonData.forEach(item => {
        const row = document.createElement("tr");

        headers.forEach(key => {
            const td = document.createElement("td");
            td.innerText = item[key];
            td.style.border = "1px solid black";
            td.style.padding = "8px";
            row.appendChild(td);
        });

        // Create actions cell
        const actionTd = document.createElement("td");
        actionTd.style.border = "1px solid black";
        actionTd.style.padding = "8px";

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.innerText = "Edit";
        editBtn.style.marginRight = "5px";
        editBtn.addEventListener("click", () => {
            // Call your edit function here
            console.log("Edit clicked for id:", item.id);
            // Example: editCategory(item);
        });

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.style.backgroundColor = "#dc3545";
        deleteBtn.style.color = "white";
        deleteBtn.addEventListener("click", () => {
            // Call your delete function here
            console.log("Delete clicked for id:", item.id);
            // Example: deleteCategory(item.id);
        });

        actionTd.appendChild(editBtn);
        actionTd.appendChild(deleteBtn);
        row.appendChild(actionTd);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Add table to container
    container.appendChild(table);
}


export function showMessage(msg, type = "info", duration = 3000) {
    const container = document.getElementById("globalMessage");

    // Create a new message element
    const messageDiv = document.createElement("div");
    messageDiv.textContent = msg;

    // Basic styles
    messageDiv.style.padding = "10px 20px";
    messageDiv.style.marginBottom = "10px";
    messageDiv.style.borderRadius = "5px";
    messageDiv.style.color = "white";
    messageDiv.style.fontWeight = "bold";
    messageDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    messageDiv.style.opacity = "0";
    messageDiv.style.transition = "opacity 0.3s ease";

    // Set background color based on type
    switch (type.toLowerCase()) {
        case "success":
            messageDiv.style.backgroundColor = "#28a745"; // green
            break;
        case "error":
            messageDiv.style.backgroundColor = "#dc3545"; // red
            break;
        case "info":
        default:
            messageDiv.style.backgroundColor = "#17a2b8"; // blue
            break;
    }

    // Append to container
    container.appendChild(messageDiv);

    // Fade in
    requestAnimationFrame(() => {
        messageDiv.style.opacity = "1";
    });

    // Remove after duration
    setTimeout(() => {
        // Fade out
        messageDiv.style.opacity = "0";
        messageDiv.addEventListener("transitionend", () => messageDiv.remove());
    }, duration);
}


