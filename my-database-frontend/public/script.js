// Handle tab switching
function openTab(tabId, element) {
    let contents = document.querySelectorAll('.content');
    let tabs = document.querySelectorAll('.sidebar a');

    contents.forEach(c => c.classList.remove('show'));
    tabs.forEach(t => t.classList.remove('active-tab'));

    document.getElementById(tabId).classList.add('show');
    element.classList.add('active-tab');
}

// Fetch Customer data
function loadCustomerData() {
    fetch('/.netlify/functions/get-items')
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
    fetch('/.netlify/functions/get-items')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('sales_record');
            container.innerHTML = data.map(item =>
                `<div class="item">${JSON.stringify(item)}</div>`
            ).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('sales_record').innerHTML =
                '<p style="color:red">Error loading data</p>';
        });
}

function loadProductData() {
    fetch('/.netlify/functions/get-items')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('product_record');
            container.innerHTML = data.map(item =>
                `<div class="item">${JSON.stringify(item)}</div>`
            ).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('product_record').innerHTML =
                '<p style="color:red">Error loading data</p>';
        });
}

function loadCategoryData() {
    fetch('/.netlify/functions/get-items')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('category_record');
            container.innerHTML = data.map(item =>
                `<div class="item">${JSON.stringify(item)}</div>`
            ).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('category_record').innerHTML =
                '<p style="color:red">Error loading data</p>';
        });
}

function loadVendorData() {
    fetch('/.netlify/functions/get-items')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('vendor_record');
            container.innerHTML = data.map(item =>
                `<div class="item">${JSON.stringify(item)}</div>`
            ).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('vendor_record').innerHTML =
                '<p style="color:red">Error loading data</p>';
        });
}

// Call automatically when page loads
document.addEventListener("DOMContentLoaded", function () {
    loadCustomerData();
    loadCategoryData();
    loadProductData();
    loadSalesData();
    loadVendorData();
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

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Add table to container
    container.appendChild(table);
}

