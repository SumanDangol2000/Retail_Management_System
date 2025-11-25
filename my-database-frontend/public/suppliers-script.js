document.getElementById("supplier_phone").addEventListener("input", function () {
  const phoneField = this;
  
    // If empty, skip regex check
  if (phoneField.value.trim() === "") {
    phoneField.setCustomValidity(""); // clear any previous error
    return;
  }

  const phoneRegex = /^[0-9]{10}$/; // only 10 digits
  if (!phoneRegex.test(phoneField.value)) {
    phoneField.setCustomValidity("Please enter a valid 10-digit phone number.");
  } else {
    phoneField.setCustomValidity(""); // clear error
  }
});