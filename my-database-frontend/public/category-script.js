import { loadCategoryData, showMessage } from "./script.js";

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
            const data = await response.json();

            // Handle non-201 responses
            if (!response.ok) {
                throw new Error(data.error || "Failed to create category");
            }

            return data;
        })
        .then(data => {
            showMessage("Record added successfully!", "success");
            loadCategoryData();

            // Optionally reset form:
            // document.getElementById("categoryForm").reset();
        })
        .catch(err => {
            console.error("Error:", err);
            showMessage("Error adding record. Please check the connection!", "error");
        });
});



