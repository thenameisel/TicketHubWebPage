//I am gonna be brutaly honest. I hate JavaScript. So Deep made most of this for me.

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('ticketForm');
    const responseMessage = document.getElementById('responseMessage');

    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });

    const countryField = document.getElementById('country');
    countryField.value = 'Canada';
    countryField.addEventListener('input', function(e) {
        e.target.value = 'Canada';
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("Submit button hit.");
        
        let isFormValid = true;
        form.querySelectorAll('input, select').forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            showResponseMessage('Please correct the errors in the form before submitting.', 'error');
            return;
        }

        const formData = {
            concertId: parseInt(document.getElementById('concertId').value),
            email: document.getElementById('email').value,
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            quantity: parseInt(document.getElementById('quantity').value),
            creditCard: document.getElementById('creditCard').value,
            expiration: document.getElementById('expiration').value,
            securityCode: document.getElementById('securityCode').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            province: document.getElementById('province').value,
            postalCode: document.getElementById('postalCode').value,
            country: document.getElementById('country').value
        };

        try {
            // Replace with your actual API endpoint
            const apiUrl = 'https://nscc-w0497862-webapp-tickethubapi-bfc2b3draacubcem.canadacentral-01.azurewebsites.net/api/Tickets';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                showResponseMessage('Ticket purchase successful! Thank you for your order.', 'success');
                form.reset();
                countryField.value = 'Canada'; 
            } else {
                const errorData = await response.json();
                
                if (errorData.errors) {
                    let errorMessages = [];
                    Object.entries(errorData.errors).forEach(([field, messages]) => {
                        const errorElement = document.getElementById(`${field}Error`);
                        if (errorElement) {
                            errorElement.textContent = messages.join(', ');
                        }
                        errorMessages.push(messages.join(', '));
                    });
                    showResponseMessage('Validation errors: ' + errorMessages.join('; '), 'error');
                } else {
                    showResponseMessage('Error: ' + (errorData.message || 'Failed to process ticket purchase'), 'error');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showResponseMessage('An unexpected error occurred. Please try again later.', 'error');
        }
    });

    function validateField(input) {
        const errorElement = document.getElementById(`${input.id}Error`);
        if (!errorElement) return true;

        errorElement.textContent = '';
        input.classList.remove('invalid');

        if (input.disabled || input.readOnly) return true;

        if (input.validity.valid) {
            return true;
        }

        if (input.validity.valueMissing) {
            errorElement.textContent = 'This field is required';
        } else if (input.validity.typeMismatch) {
            if (input.type === 'email') {
                errorElement.textContent = 'Please enter a valid email address';
            }
        } else if (input.validity.patternMismatch) {
            switch(input.id) {
                case 'phone':
                    errorElement.textContent = 'Please enter a valid phone number (e.g., 555-123-4567)';
                    break;
                case 'creditCard':
                    errorElement.textContent = 'Please enter a valid 13-16 digit credit card number';
                    break;
                case 'expiration':
                    errorElement.textContent = 'Please enter a valid expiration date (MM/YY)';
                    break;
                case 'securityCode':
                    errorElement.textContent = 'Security code must be 3 or 4 digits';
                    break;
                case 'postalCode':
                    errorElement.textContent = 'Please enter a valid Canadian postal code (e.g., A1A 1A1)';
                    break;
                default:
                    errorElement.textContent = 'Invalid format';
            }
        } else if (input.validity.rangeUnderflow || input.validity.rangeOverflow) {
            if (input.id === 'concertId') {
                errorElement.textContent = 'Concert ID must be between 1 and 200';
            } else if (input.id === 'quantity') {
                errorElement.textContent = 'Quantity must be between 1 and 25';
            }
        } else if (input.validity.tooShort || input.validity.tooLong) {
            errorElement.textContent = input.validationMessage;
        }

        if (errorElement.textContent) {
            input.classList.add('invalid');
            return false;
        }

        return true;
    }

    function showResponseMessage(message, type) {
        responseMessage.textContent = message;
        responseMessage.style.display = 'block';
        responseMessage.className = type; 
        
        const timeout = type === 'success' ? 5000 : 10000;
        setTimeout(() => {
            responseMessage.style.display = 'none';
        }, timeout);
    }
});