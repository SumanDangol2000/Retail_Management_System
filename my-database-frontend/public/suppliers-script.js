import { loadData, showMessage } from "./script.js";

// Handle form submission
document.getElementById("suppliersForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    supplier_name: document.getElementById("supplier_name").value.trim(),
    contact_person: document.getElementById("supplier_contact_person").value.trim(), // selected ID
    phone: document.getElementById("supplier_phone").value.trim(), // selected ID
    email: document.getElementById("supplier_email").value.trim(),
    address: document.getElementById("supplier_address").value.trim(),
  };

  console.log("Form Data:", data);

  // Example: send to backend
  fetch("/.netlify/functions/suppliers-create-item", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      // Handle non-201 responses
      if (!response.ok) {
        showMessage("Failed to create product");
        return;
      }

      showMessage("Product added successfully!", "success");
      loadData("/.netlify/functions/suppliers-get-items", "suppliers_record", "suppliers");

      // return data;
    })
    .catch((err) => {
      console.error("Error:", err);
      showMessage("Error adding record. Please check the connection!", "error");
    });
});

document
  .getElementById("supplier_phone")
  .addEventListener("input", function () {
    const phoneField = this;

    // If empty, skip regex check
    if (phoneField.value.trim() === "") {
      phoneField.setCustomValidity(""); // clear any previous error
      return;
    }

    const phoneRegex = /^[0-9]{10}$/; // only 10 digits
    if (!phoneRegex.test(phoneField.value)) {
      phoneField.setCustomValidity(
        "Please enter a valid 10-digit phone number."
      );
    } else {
      phoneField.setCustomValidity(""); // clear error
    }
  });
