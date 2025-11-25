document.getElementById("customer_contact").addEventListener("input", function () {
  const phoneField = this;
  const phoneRegex = /^[0-9]{10}$/; // only 10 digits
  if (!phoneRegex.test(phoneField.value)) {
    phoneField.setCustomValidity("Please enter a valid 10-digit phone number.");
  } else {
    phoneField.setCustomValidity(""); // clear error
  }
});