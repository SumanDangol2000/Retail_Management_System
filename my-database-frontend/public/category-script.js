import { loadData, showMessage } from "./script.js";

document.getElementById("categoryForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const category_name = document.getElementById("category_name").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!category_name) {
        showMessage("Category name is required", "error");
        return;
    }

    fetch('/.netlify/functions/category-create-item', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_name, description })
    })
        .then(async response => {

            // Handle non-201 responses
            if (!response.ok) {
                showMessage("Failed to create category");
                return;
            }

            showMessage("Record added successfully!", "success");
            loadData('/.netlify/functions/category-get-items', 'category_record', 'category');

            // return data;
        })
        .catch(err => {
            console.error("Error:", err);
            showMessage("Error adding record. Please check the connection!", "error");
        });
});



