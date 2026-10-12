// Get the form and important elements.
const form = document.getElementById("registrationForm");
const successMessage = document.getElementById("successMessage");
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const agreement = document.getElementById("agreement");

let submittedOnce = false;

// Set today's date as the latest allowed birth date.
// This dynamically changes the HTML "max" attribute.
const dob = document.getElementById("dob");
const today = new Date();
const localToday =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

dob.setAttribute("max", localToday);

// Validate a single field and return its error message.
function getErrorMessage(field) {
    // Use dataset to read the custom data-* attributes.
    const isRequired = field.dataset.required === "true";
    const value = field.value.trim();

    if (isRequired && value === "") {
        return "This field is required.";
    }

    // Optional: stop here for an empty non-required field.
    if (value === "") {
        return "";
    }

    switch (field.id) {
        case "studentId":
            if (value.length < 4) {
                return "Student ID must contain at least 4 characters.";
            }
            break;

        case "fullName":
            if (value.length < 2) {
                return "Please enter your full name.";
            }
            break;

        case "email": {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                return "Enter a valid email address, such as student@example.com.";
            }
            break;
        }

        case "phone": {
            // Accept Philippine mobile numbers:
            // 09XXXXXXXXX or +639XXXXXXXXX.
            const phonePattern = /^(09\d{9}|\+639\d{9})$/;
            if (!phonePattern.test(value)) {
                return "Use 09XXXXXXXXX or +639XXXXXXXXX format.";
            }
            break;
        }

        case "dob":
            if (value > localToday) {
                return "Date of birth cannot be in the future.";
            }
            break;

        case "password": {
            // Read the minimum length from data-min-length.
            const minLength = Number(field.dataset.minLength);
            if (value.length < minLength) {
                return `Password must contain at least ${minLength} characters.`;
            }
            break;
        }

        case "confirmPassword":
            if (value !== password.value.trim()) {
                return "Passwords do not match.";
            }
            break;

        case "address":
            if (value.length < 5) {
                return "Please enter your complete address.";
            }
            break;
    }

    return "";
}

// Display or remove an individual field's error.
function showFieldError(field, message) {
    // Find the message element using the data-error attribute.
    const errorElement = document.getElementById(field.dataset.error);

    errorElement.textContent = message;
    field.classList.toggle("error", message !== "");

    if (message) {
        field.setAttribute("aria-invalid", "true");
    } else {
        field.removeAttribute("aria-invalid");
    }
}

// Check a field and update its error message.
function validateField(field) {
    const message = getErrorMessage(field);
    showFieldError(field, message);
    return message === "";
}

// Validate the agreement checkbox separately.
function validateAgreement() {
    const errorElement = document.getElementById("agreementError");
    const message = agreement.checked
        ? ""
        : "You must agree before submitting the form.";

    errorElement.textContent = message;
    agreement.classList.toggle("error", message !== "");

    if (message) {
        agreement.setAttribute("aria-invalid", "true");
    } else {
        agreement.removeAttribute("aria-invalid");
    }

    return message === "";
}

// Collect fields that have their own data-error attribute.
const fields = Array.from(
    form.querySelectorAll("input[data-error], select[data-error], textarea[data-error]")
);

// Validate the form when submitted.
form.addEventListener("submit", function(event) {
    // Prevent the browser's default form submission.
    event.preventDefault();
    submittedOnce = true;

    // Remove unnecessary spaces from ordinary text fields.
    fields.forEach(function(field) {
        if (field.type !== "password" && field.type !== "checkbox") {
            field.value = field.value.trim();
        }
    });

    // Validate every field and the agreement checkbox.
    let isFormValid = true;

    fields.forEach(function(field) {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });

    if (!validateAgreement()) {
        isFormValid = false;
    }

    // Do not show success if any field is invalid.
    if (!isFormValid) {
        successMessage.hidden = true;

        const firstInvalid = form.querySelector(".error");
        if (firstInvalid) {
            firstInvalid.focus();
        }
        return;
    }

    // Clear any remaining validation errors.
    fields.forEach(function(field) {
        showFieldError(field, "");
    });
    validateAgreement();

    successMessage.textContent =
        "Registration successful! Your information has been validated.";
    successMessage.hidden = false;

    // Bring the success message into view.
    successMessage.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
});

// Remove errors as the user corrects their entries.
fields.forEach(function(field) {
    field.addEventListener("input", function(event) {
        if (submittedOnce) {
            validateField(event.currentTarget);

            // Recheck password confirmation when either password changes.
            if (event.currentTarget === password) {
                validateField(confirmPassword);
            }
        }
    });

    field.addEventListener("change", function(event) {
        if (submittedOnce) {
            validateField(event.currentTarget);
        }
    });
});

// Recheck the agreement when the checkbox changes.
agreement.addEventListener("change", function() {
    if (submittedOnce) {
        validateAgreement();
    }
});

// Show or hide both password fields.
togglePassword.addEventListener("click", function() {
    const shouldShow = password.type === "password";

    // Meaningful HTML attribute manipulation.
    password.setAttribute("type", shouldShow ? "text" : "password");
    confirmPassword.setAttribute("type", shouldShow ? "text" : "password");

    togglePassword.textContent = shouldShow
        ? "Hide Passwords"
        : "Show Passwords";

    togglePassword.setAttribute("aria-pressed", String(shouldShow));

    // Use classList.toggle() for interactive visual feedback.
    togglePassword.classList.toggle("active", shouldShow);
});

// Restore the form to its original state when Reset is clicked.
form.addEventListener("reset", function() {
    submittedOnce = false;

    fields.forEach(function(field) {
        showFieldError(field, "");
    });

    agreement.classList.remove("error");
    agreement.removeAttribute("aria-invalid");
    document.getElementById("agreementError").textContent = "";

    successMessage.textContent = "";
    successMessage.hidden = true;

    // Restore password attributes and button appearance.
    password.setAttribute("type", "password");
    confirmPassword.setAttribute("type", "password");
    togglePassword.textContent = "Show Passwords";
    togglePassword.setAttribute("aria-pressed", "false");
    togglePassword.classList.remove("active");
});