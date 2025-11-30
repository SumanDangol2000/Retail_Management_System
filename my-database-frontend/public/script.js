import { createTableFromJSON } from "./table-script.js";

export function loadData(endpoint, containerId, tableName, isActionRequire = true) {
    fetch(endpoint)
        .then((resp) => resp.json())
        .then((data) => createTableFromJSON(data, containerId, tableName, isActionRequire))
        .catch((err) => {
            console.error("Error:", err);
            document.getElementById(containerId).innerHTML =
                '<p style="color:red">Error loading data</p>';
        });
}

function loadDataCount(endpoint, containerId) {
    fetch(endpoint)
        .then((resp) => resp.json())
        .then((data) => {
            console.log(data)
            const container = document.getElementById(containerId);
            container.innerHTML = data;
        })
        .catch((err) => {
            console.error("Error:", err);
            document.getElementById(containerId).innerHTML =
                '<p style="color:red">Error loading data</p>';
        });
}

document.addEventListener("DOMContentLoaded", () => {
    
    loadData("/.netlify/functions/customer-get-items", "customer_record", "customer");
    loadData("/.netlify/functions/category-get-items", "category_record", "category");
    loadData("/.netlify/functions/product-get-items", "product_record", "product");
    
    loadData("/.netlify/functions/sales-get-items", "sales_record", "sales");
    
    loadData("/.netlify/functions/suppliers-get-items", "suppliers_record", "suppliers");
    loadDashboardData()

});

window.initHome = function() {
  loadDashboardData();
};


function loadDashboardData(){
    loadData("/.netlify/functions/product-get-availabe-product", "available_product_record", "available_product", false);
loadData("/.netlify/functions/sales-get-sales-summary", "sales_summary_record", "sales_summary", false);

    loadDataCount("/.netlify/functions/customer-get-item-count", "totalCustomers");
    loadDataCount("/.netlify/functions/suppliers-get-item-count", "totalSuppliers");

    loadDataCount("/.netlify/functions/sales-get-previous-sales", "lastMonthSales");
    loadDataCount("/.netlify/functions/sales-get-current-sales", "thisMonthSales");
    loadDataCount("/.netlify/functions/sales-get-todays-sales", "todaySales");

    loadSalesChart();
}

async function loadSalesChart() {
  const response = await fetch('/.netlify/functions/sales-get-sales-chart');
  const data = await response.json();

  // Prepare chart data
  const months = [...new Set(data.map(item => item.sale_month))]; 
  const products = [...new Set(data.map(item => item.product_name))];

  // Build dataset for each product
  const datasets = products.map(product => {
    return {
      label: product,
      data: months.map(month => {
        const record = data.find(d => d.product_name === product && d.sale_month === month);
        return record ? record.total_sold : 0;
      }),
      fill: false,
      borderWidth: 2
    };
  });

  // Render chart
  const ctx = document.getElementById('salesChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',    // change to 'bar' for bar chart
    data: {
      labels: months,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Product Sales Per Month' },
      },
      interaction: { intersect: false, mode: 'index' },
    }
  });
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
