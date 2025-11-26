import { loadData, showMessage } from "./script.js";

document.addEventListener("DOMContentLoaded", function () {
  // Load customer
  fetch("/.netlify/functions/customer-get-items")
    .then(response => response.json())
    .then(data => {
      const categorySelect = document.getElementById("sales_customer");
      data.forEach(customer => {
        let option = document.createElement("option");
        option.value = customer.customer_id; 
        option.textContent = customer.first_name + " " + customer.last_name;
        categorySelect.appendChild(option);
      });
    });

  // Load product
  fetch("/.netlify/functions/product-get-items")
    .then(response => response.json())
    .then(data => {
      const supplierSelect = document.getElementById("sales_product");
      data.forEach(product => {
        let option = document.createElement("option");
        option.value = product.product_id;
        option.textContent = product.product_name;
        supplierSelect.appendChild(option);
      });
    });

  // Handle form submission
  document.getElementById("salesForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
      customer_id: document.getElementById("sales_customer").value.trim(),
      product_id: document.getElementById("sales_product").value.trim(), 
      quantity_sold: document.getElementById("sales_quantity_sold").value.trim(), 
      total_amount: document.getElementById("sales_total_amount").value.trim()
    };

    console.log("Data:", data);

    // Example: send to backend
    fetch("/.netlify/functions/sales-create-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(async response => {
    
        // Handle non-201 responses
        if (!response.ok) {
            showMessage("Failed to create product");
            return;
        }

        showMessage("Record added successfully!", "success");
        loadData("/.netlify/functions/sales-get-items", "sales_record", "sales");

        // return data;
    })
    .catch(err => {
        console.error("Error:", err);
        showMessage("Error adding record. Please check the connection!", "error");
    });

  });

});