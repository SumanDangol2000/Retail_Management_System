import { loadData, showMessage } from "./script.js";

document.addEventListener("DOMContentLoaded", function () {
  // Load categories
  fetch("/.netlify/functions/category-get-items")
    .then(response => response.json())
    .then(data => {
      const categorySelect = document.getElementById("product_category");
      data.forEach(category => {
        let option = document.createElement("option");
        option.value = category.category_id; 
        option.textContent = category.category_name;
        categorySelect.appendChild(option);
      });
    });

  // Load suppliers
  fetch("/.netlify/functions/suppliers-get-items")
    .then(response => response.json())
    .then(data => {
      const supplierSelect = document.getElementById("product_supplier");
      data.forEach(supplier => {
        let option = document.createElement("option");
        option.value = supplier.supplier_id;
        option.textContent = supplier.supplier_name;
        supplierSelect.appendChild(option);
      });
    });

  // Handle form submission
  document.getElementById("productForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const productData = {
      product_name: document.getElementById("product_name").value.trim(),
      category_id: document.getElementById("product_category").value.trim(), // selected ID
      supplier_id: document.getElementById("product_supplier").value.trim(), // selected ID
      price: document.getElementById("product_price").value.trim(),
      quantity: document.getElementById("product_quantity").value.trim()
    };

    console.log("Form Data:", productData);

    // Example: send to backend
    fetch("/.netlify/functions/product-create-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData)
    })
    .then(async response => {
    
        // Handle non-201 responses
        if (!response.ok) {
            showMessage("Failed to create product");
            return;
        }

        showMessage("Product added successfully!", "success");
            loadData("/.netlify/functions/product-get-items", "product_record", "product");

        // return data;
    })
    .catch(err => {
        console.error("Error:", err);
        showMessage("Error adding record. Please check the connection!", "error");
    });

  });

   document.getElementById("product_clear").onclick = () => {
        document.getElementById("product_name").value = "";
        // document.getElementById("product_category").value = "";
        // document.getElementById("product_supplier").value = "";
        document.getElementById("product_price").value = "";
        document.getElementById("product_quantity").value = "";
    };

});