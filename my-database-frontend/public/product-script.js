import { loadData, showMessage } from "./script.js";

  let currentPage = 1;
  const pageSize = 5;
  let currentFilter = "all";

document.addEventListener("DOMContentLoaded", function () {
  // Load categories
    loadCategories();

  // Load suppliers
    loadSuppliers();


  // Handle form submission
  document.getElementById("productForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const productData = {
      product_name: document.getElementById("product_name").value.trim(),
      category_id: document.getElementById("product_category").value.trim(), // selected ID
      supplier_id: document.getElementById("product_supplier").value.trim(), // selected ID
      price: document.getElementById("product_price").value.trim(),
      quantity_in_stock: document.getElementById("product_quantity").value.trim()
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


  document.getElementById("productSearchBox").addEventListener("input", async (e) => {
    loadData(
      `/.netlify/functions/product-get-filter-items?keyword=${encodeURIComponent(e.target.value)}`,
      "product_record",
      "product"
    );
  });

  

  document.getElementById("productSalesFilter").addEventListener("change", (e) => {
    currentFilter = e.target.value; 
    currentPage = 1;                 
    loadProductSalesFilteredData();
  });

  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadProductSalesFilteredData();
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    currentPage++;
    loadProductSalesFilteredData();
  });


});


  export function loadProductSalesFilteredData() {
    // use currentFilter instead of e.target.value
      loadData(
        `/.netlify/functions/product-sales-summary?filterType=${encodeURIComponent(currentFilter)}&page=${encodeURIComponent(currentPage)}&pageSize=${encodeURIComponent(pageSize)}`,
        "sales_summary_record",
        "sales_summary",
        false
    );

    // update page info
    document.getElementById("pageInfo").textContent = `${currentPage}`;
  }

  window.initProduct = function(){
    loadCategories();
    loadSuppliers();
    loadData("/.netlify/functions/product-get-items", "product_record", "product");
  }

function loadCategories(){
    fetch("/.netlify/functions/category-get-items")
    .then(response => response.json())
    .then(data => {
      const categorySelect = document.getElementById("product_category");
      categorySelect.innerHTML = "";
      data.forEach(category => {
        let option = document.createElement("option");
        option.value = category.category_id; 
        option.textContent = category.category_name;
        categorySelect.appendChild(option);
      });
    });
}

function loadSuppliers(){
    fetch("/.netlify/functions/suppliers-get-items")
    .then(response => response.json())
    .then(data => {
      const supplierSelect = document.getElementById("product_supplier");
      supplierSelect.innerHTML = "";
      data.forEach(supplier => {
        let option = document.createElement("option");
        option.value = supplier.supplier_id;
        option.textContent = supplier.supplier_name;
        supplierSelect.appendChild(option);
      });
    });
}