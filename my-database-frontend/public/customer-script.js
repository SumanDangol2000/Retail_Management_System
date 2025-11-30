import { loadData, showMessage } from "./script.js";

document.getElementById("customerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    first_name: document.getElementById("customer_first_name").value.trim(),
    last_name: document.getElementById("customer_last_name").value.trim(), 
    contact_number: document.getElementById("customer_contact").value.trim(), 
    email: document.getElementById("customer_email").value.trim(),
    address: document.getElementById("customer_address").value.trim(),
  };

  console.log("Form Data:", data);

  // Example: send to backend
  fetch("/.netlify/functions/customer-create-item", {
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

      showMessage("Customer added successfully!", "success");
      loadData("/.netlify/functions/customer-get-items", "customer_record", "customer");

      // return data;
    })
    .catch((err) => {
      console.error("Error:", err);
      showMessage("Error adding record. Please check the connection!", "error");
    });
});

document
  .getElementById("customer_contact")
  .addEventListener("input", function () {
    const phoneField = this;
    const phoneRegex = /^[0-9]{10}$/; // only 10 digits
    if (!phoneRegex.test(phoneField.value)) {
      phoneField.setCustomValidity(
        "Please enter a valid 10-digit phone number."
      );
    } else {
      phoneField.setCustomValidity(""); // clear error
    }
  });
